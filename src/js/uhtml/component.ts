
import { reactive } from 'uhtml/reactive';
import { Signal, effect } from '@preact/signals-core';

interface ElementCallback<E extends HTMLElement> {
    element: E;
}

interface AttributeChangeCallback<E extends HTMLElement> {
    element: E;
    name: string;
    oldValue: string | null;
    newValue: string | null;
}

interface BaseConsumerProps<T extends HTMLElement, S = unknown, C = {}, A = {}> {
    render?: (props: { state: S; computed: C; actions: A, slots: Record<string, Node[]>, }) => (() => unknown) | unknown;
    connected?: (params: ElementCallback<T>) => void;
    disconnected?: (params: ElementCallback<T>) => void;
}

interface ListenerParams<S> {
    newValue: S;
    oldValue: S;
}

const uRender = reactive(effect);

export function createComponent<T extends HTMLElement = HTMLElement, S = any, C = {}, A = {}>({
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
    state?: Signal<S>;
    listen?: (params: ListenerParams<S>) => void;
    attributeChanged?: (params: AttributeChangeCallback<T>) => void;
    observedAttributes?: string[];
    computed?: C;
    actions?: A;
} & BaseConsumerProps<T, S, C, A>): void {
    if (customElements.get(tagName)) return;

    class CustomElement extends HTMLElement {
        private slotContent: Record<string, Node[]> = {};

        public get state() {
            return state;
        }

        public get actions() {
            return actions;
        }

        public get computed() {
            return computed;
        }

        public subscribeToState(callback: (value: S) => void) {
            if (!state) return () => { };

            const dispose = effect(() => {
                callback(state.value);
            });

            this.subScirbeDisposer.push(dispose);

            return dispose;
        }

        private renderDisposer?: ReturnType<typeof uRender>;

        private listenerDisposer?: ReturnType<typeof effect>;

        private subScirbeDisposer: ReturnType<typeof effect>[] = [];

        private currentValue?: S;

        static get observedAttributes() {
            return observedAttributes;
        }

        connectedCallback() {
            try {
                connected?.({ element: this as unknown as T });

                this.doListen();

                requestAnimationFrame(() => {
                    this.collectSlots();
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

        private doRender() {
            if (!render) return;

            const renderFn = () => {
                return render.bind(this)({
                    state: state?.value ?? ({} as unknown as S),
                    computed,
                    actions,
                    slots: this.slotContent,
                });
            };

            this.renderDisposer = uRender(this, renderFn);
        }

        private doListen() {
            if (!state || !listen) return;

            this.currentValue = state.peek();
            this.listenerDisposer = effect(() => {
                const newValue = state?.value;
                if (this.currentValue !== newValue) {
                    listen({
                        newValue,
                        oldValue: this.currentValue ?? ({} as unknown as S),
                    });
                    this.currentValue = newValue;
                }
            });
        }

        disconnectedCallback() {
            if (this.renderDisposer && typeof this.renderDisposer === 'function') {
                this.renderDisposer();
            }

            if (this.listenerDisposer && typeof this.listenerDisposer === 'function') {
                this.listenerDisposer();
            }

            this.subScirbeDisposer.map((unsub) => unsub());

            disconnected?.({ element: this as unknown as T });
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
            attributeChanged?.({
                element: this as unknown as T,
                name,
                oldValue,
                newValue,
            });
        }
    }

    customElements.define(tagName, CustomElement);
}
