import { reactive } from 'uhtml/reactive';
import { effect } from '@preact/signals-core';
import { ComputedResult, State, compute } from './state';

// Base generic parameter interfaces
export interface ComponentState<S = any> {
    state: () => State<S>;
}

export interface ComponentComputed<S = any, C = any> {
    computed: (context: { state: State<S> }) => C;
}

export interface ComponentActions<S = any, C = any, A = any> {
    actions: (context: { state: State<S>, computed: C }) => A;
}

// Helper types for component context
type StateContext<S> = {
    state: State<S>;
};

type ComputedContext<S, C> = {
    state: State<S>;
    computed: C;
};

type ComponentContext<S, C, A> = {
    state: State<S>;
    computed: C;
    actions: A;
    slots: Record<string, Node[]>;
    element: CustomHtmlElement<S, C, A>;
};

// Event interfaces
interface ListenerParams<S, C, A> extends ComponentContext<S, C, A> {
    newValue: S;
    oldValue: S;
}

interface AttributeChangeCallback<S, C, A> extends ComponentContext<S, C, A> {
    name: string;
    oldValue: string | null;
    newValue: string | null;
}

// Component options interface
export interface ComponentOptions<S = any, C = any, A = any> {
    tagName: string;
    observedAttributes?: string[];
    state?: () => State<S>;
    computed?: (context: StateContext<S>) => C;
    actions?: (context: ComputedContext<S, C>) => A;
    connected?: (context: ComponentContext<S, C, A>) => void;
    disconnected?: (context: ComponentContext<S, C, A>) => void;
    render?: (context: ComponentContext<S, C, A>) => unknown;
    listen?: (params: ListenerParams<S, C, A>) => void;
    attributeChanged?: (params: AttributeChangeCallback<S, C, A>) => void;
}

// Custom element interface
export interface CustomHtmlElement<S, C, A> extends HTMLElement {
    readonly context: ComponentContext<S, C, A>;
    readonly state: State<S>;
    readonly computed: C;
    readonly actions: A;
    subscribeToState(callback: (params: ListenerParams<S, C, A>) => void): () => void;
    emitEvent<T = any>(name: string, detail: T): void;
}

// Component creation function with proper type inference
export function createComponent<
    S = any,
    C extends Record<string, ComputedResult<any>> = any,
    A extends Record<string, (...args: any[]) => any> = any
>(options: ComponentOptions<S, C, A> & Partial<ComponentState<S> & ComponentComputed<S, C> & ComponentActions<S, C, A>>) {
    const {
        tagName,
        state,
        computed: createComputed = () => ({} as C),
        actions: createActions = () => ({} as A),
        connected,
        disconnected,
        render,
        listen,
        attributeChanged,
        observedAttributes = [],
    } = options;

    if (customElements.get(tagName)) {
        throw new Error(`Component with tag name "${tagName}" is already defined`);
    }

    const uRender = reactive(effect);
    const instances = new WeakMap<CustomElement, {
        state: State<S>;
        computed: C;
        actions: A;
    }>();

    class CustomElement extends HTMLElement implements CustomHtmlElement<S, C, A> {
        private slotContent: Record<string, Node[]> = {};
        private renderDisposer?: ReturnType<typeof uRender>;
        private listenerDisposer?: ReturnType<typeof effect>;
        private subscribeDisposer: ReturnType<typeof effect>[] = [];

        constructor() {
            super();

            const createdState = (state && typeof state === "function" ? state() : undefined) as State<S>;

            const computedContext = {
                state: createdState
            };

            const computed = createComputed(computedContext);

            const actionsContext = {
                state: createdState,
                computed
            };

            const actions = createActions(actionsContext);

            instances.set(this, {
                state: createdState,
                computed,
                actions
            });
        }

        public get state(): State<S> {
            return instances.get(this)!.state;
        }

        public get computed(): C {
            return instances.get(this)!.computed;
        }

        public get actions(): A {
            return instances.get(this)!.actions;
        }

        public get context(): ComponentContext<S, C, A> {
            return {
                state: this.state,
                computed: this.computed,
                actions: this.actions,
                slots: this.slotContent,
                element: this,
            };
        }

        static get observedAttributes() {
            return observedAttributes;
        }

        public subscribeToState(callback: (params: ListenerParams<S, C, A>) => void): () => void {
            const disposer = this.setupEffect(callback);
            this.subscribeDisposer.push(disposer);
            return () => {
                const index = this.subscribeDisposer.indexOf(disposer);
                if (index !== -1) {
                    this.subscribeDisposer.splice(index, 1);
                }
                disposer();
            };
        }

        public emitEvent<T = any>(name: string, detail: T): void {
            this.dispatchEvent(new CustomEvent(name, { detail }));
        }

        private setupEffect(
            callback: (params: ListenerParams<S, C, A>) => void
        ): ReturnType<typeof effect> {
            let previousValue = this.state.peek();
            return effect(() => {
                const currentValue = this.state.value;
                callback({
                    newValue: currentValue,
                    oldValue: previousValue,
                    ...this.context
                });
                previousValue = currentValue;
            });
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
                } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                    slots.default.push(node);
                }
            };

            Array.from(this.childNodes).forEach(processNode);

            this.slotContent = {
                ...slots.named,
                default: slots.default
            };
        }

        connectedCallback() {
            try {
                requestAnimationFrame(() => {
                    this.collectSlots();
                    connected?.(this.context);
                    this.setupListener();
                    this.setupRender();
                });
            } catch (error) {
                console.error(`Error in ${tagName} connectedCallback:`, error);
            }
        }

        private setupRender() {
            if (!render) return;
            this.renderDisposer = uRender(this, () => render(this.context));
        }

        private setupListener() {
            if (!listen) return;
            this.listenerDisposer = this.setupEffect(listen);
        }

        disconnectedCallback() {
            try {
                this.renderDisposer?.();
                this.listenerDisposer?.();
                this.subscribeDisposer.forEach(unsub => unsub());
                this.subscribeDisposer = [];
                disconnected?.(this.context);
                instances.delete(this);
            } catch (error) {
                console.error(`Error in ${tagName} disconnectedCallback:`, error);
            }
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
            try {
                attributeChanged?.({
                    ...this.context,
                    name,
                    oldValue,
                    newValue,
                } as AttributeChangeCallback<S, C, A>);
            } catch (error) {
                console.error(`Error in ${tagName} attributeChangedCallback:`, error);
            }
        }
    }

    customElements.define(tagName, CustomElement);

    return { tagName };
}