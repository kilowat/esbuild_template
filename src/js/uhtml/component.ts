
import { reactive } from 'uhtml/reactive';
import { effect } from '@preact/signals-core';
import { EnhancedSignal } from './state';


interface Context<S = any, C = {}, A = {}> {
    element: HTMLElement;
    state: S;
    computed: C;
    actions: A,
    slots: Record<string, Node[]>,
}

interface AttributeChangeCallback extends Context {
    name: string;
    oldValue: string | null;
    newValue: string | null;
}

interface ListenerParams<S> extends Context {
    newValue: S;
    oldValue: S;
}


export function createComponent<S extends EnhancedSignal<any> = any, C extends {} = {}, A extends {} = {}>({
    tagName,
    connected,
    render,
    disconnected,
    attributeChanged,
    observedAttributes = [],
    listen,
    state,
    computed = {} as C,
    actions = {} as A,
}: {
    tagName: string;
    state?: S;
    render?: (context: Context<S, C, A>) => (() => unknown) | unknown;
    connected?: (context: Context<S, C, A>) => void;
    disconnected?: (context: Context<S, C, A>) => void;
    listen?: (params: ListenerParams<S>) => void;
    attributeChanged?: (params: AttributeChangeCallback) => void;
    observedAttributes?: string[];
    computed?: C;
    actions?: A;
}): void {
    if (customElements.get(tagName)) return;

    const uRender = reactive(effect);

    class CustomElement extends HTMLElement {
        public get state() {
            return state;
        }

        public get actions() {
            return actions;
        }

        public get computed() {
            return computed;
        }

        public subscribeToState(callback: (params: ListenerParams<S>) => void) {
            if (!state) return () => { };

            return this.setupEffect(state, callback);
        }

        public emitEvent(name: string, detail: any) {
            this.dispatchEvent(new CustomEvent(name, { detail }));
        }

        static get observedAttributes() {
            return observedAttributes;
        }

        private slotContent: Record<string, Node[]> = {};

        private renderDisposer?: ReturnType<typeof uRender>;

        private listenerDisposer?: ReturnType<typeof effect>;

        private subscribeDisposer: ReturnType<typeof effect>[] = [];

        private setupEffect<T>(stateSignal: EnhancedSignal<T>, callback: (params: ListenerParams<T>) => void): ReturnType<typeof effect> {
            let previousValue = stateSignal.peek();
            return effect(() => {
                const currentValue = stateSignal.value;
                if (previousValue !== currentValue) {
                    callback({ newValue: currentValue, oldValue: previousValue, ...this.context });
                    previousValue = currentValue;
                }
            });
        }

        connectedCallback() {
            try {
                requestAnimationFrame(() => {
                    this.collectSlots();
                    connected?.(this.context);
                    this.doListen();
                    this.doRender();
                });
            } catch (error) {
                console.error(`Error in ${tagName} connectedCallback:`, error);
            }
        }

        private collectSlots() {
            const slots = {
                default: [] as Node[],
                named: {} as Record<string, Node[]>
            };

            const processElementNode = (node: Element) => {
                const slotName = node.getAttribute('data-slot');

                if (!slotName) {
                    slots.default.push(node);
                    return;
                }

                if (!slots.named[slotName]) {
                    slots.named[slotName] = [];
                }
                slots.named[slotName].push(node);
            };

            const processNode = (node: Node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processElementNode(node as Element);
                } else {
                    slots.default.push(node);
                }
            };

            (this.childNodes ?? []).forEach(processNode);

            this.slotContent = {
                ...slots.named,
                default: slots.default
            };
        }

        public get context() {
            return {
                state: state ?? ({} as unknown as S),
                computed: computed ?? {},
                actions,
                slots: this.slotContent,
                element: (this as HTMLElement),
            }
        }

        private doRender() {
            if (!render) return;

            const renderFn = () => {
                return render.bind(this)(this.context);
            };

            this.renderDisposer = uRender(this, renderFn);
        }

        private doListen() {
            if (!state || !listen) return;

            this.listenerDisposer = this.setupEffect(state, listen);
        }

        disconnectedCallback() {
            if (this.renderDisposer && typeof this.renderDisposer === 'function') {
                this.renderDisposer();
            }

            if (this.listenerDisposer && typeof this.listenerDisposer === 'function') {
                this.listenerDisposer();
            }

            this.subscribeDisposer.map((unsub) => unsub());

            disconnected?.(this.context);
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
            attributeChanged?.({
                ...this.context,
                name,
                oldValue,
                newValue,
            });
        }
    }

    customElements.define(tagName, CustomElement);
}
