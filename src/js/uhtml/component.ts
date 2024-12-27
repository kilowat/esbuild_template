
import { reactive } from 'uhtml/reactive';
import { effect } from '@preact/signals-core';
import { State } from './state';


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

export function createComponent<S extends State<any> = any, C extends {} = {}, A extends {} = {}>({
    tagName,
    connected,
    render,
    disconnected,
    attributeChanged,
    observedAttributes = [],
    listen,
    state,
    computed = {} as C | ((context: Context<S, {}, {}>) => C),
    actions = {} as A | ((context: Context<S, {}, {}>) => A),
}: {
    tagName: string;
    state?: S;
    render?: (context: Context<S, C, A>) => (() => unknown) | unknown;
    connected?: (context: Context<S, C, A>) => void;
    disconnected?: (context: Context<S, C, A>) => void;
    listen?: (params: ListenerParams<S>) => void;
    attributeChanged?: (params: AttributeChangeCallback) => void;
    observedAttributes?: string[];
    computed?: C | ((context: Context<S, {}, {}>) => C);
    actions?: A | ((context: Context<S, {}, {}>) => A);
}): void {

    if (customElements.get(tagName)) return;

    const uRender = reactive(effect);

    class CustomElement extends HTMLElement {
        private computedValue: C;
        private actionsValue: A;

        constructor() {
            super();
            const context = this.context;

            // Явно проверяем, является ли computed функцией
            this.computedValue =
                typeof computed === "function"
                    ? (computed as (context: Context<S, C, A>) => C)(context)
                    : (computed as C);

            // Явно проверяем, является ли actions функцией
            this.actionsValue =
                typeof actions === "function"
                    ? (actions as (context: Context<S, C, A>) => A)(context)
                    : (actions as A);
        }

        public get state() {
            return state;
        }

        public get actions() {
            return this.actionsValue;
        }

        public get computed() {
            return this.computedValue;
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

        private setupEffect<T>(stateSignal: State<T>, callback: (params: ListenerParams<T>) => void): ReturnType<typeof effect> {
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
                computed: this.computedValue ?? {},
                actions: this.actionsValue ?? {},
                slots: this.slotContent,
                element: (this as HTMLElement),
            };
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
