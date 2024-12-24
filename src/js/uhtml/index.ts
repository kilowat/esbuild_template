import { reactive } from 'uhtml/reactive';
import { Signal, effect, signal as createSignal, computed as preactComputed } from '@preact/signals-core';

export { html, htmlFor } from 'uhtml/reactive';

const uRender = reactive(effect);

class EnhancedSignal<T> extends Signal<T> {
    emit(value: Partial<T> | T): void {
        if (typeof value === 'object' && value !== null && typeof this.value === 'object') {
            const currentClone = cloneDeep(this.value);
            this.value = { ...currentClone, ...value } as T;
        } else {
            this.value = value as T;
        }
    }
}

export function state<T>(initialValue: T): EnhancedSignal<T> {
    const baseSignal = createSignal(initialValue);
    Object.setPrototypeOf(baseSignal, EnhancedSignal.prototype);
    return baseSignal as EnhancedSignal<T>;
}

function cloneDeep<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(cloneDeep) as unknown as T;
    }

    const clonedObj: Record<PropertyKey, any> = {};
    for (const key of Reflect.ownKeys(obj)) {
        clonedObj[key as keyof typeof obj] = cloneDeep((obj as Record<PropertyKey, any>)[key]);
    }

    return clonedObj as T;
}

export interface ElementCallback<E extends HTMLElement> {
    element: E;
}

export interface AttributeChangeCallback<E extends HTMLElement> {
    element: E;
    name: string;
    oldValue: string | null;
    newValue: string | null;
}

export interface BaseConsumerProps<T extends HTMLElement, S = unknown, C = {}, A = {}> {
    render?: (props: { state: S; computed: C; actions: A, slots: Record<string, Node[]>, }) => (() => unknown) | unknown;
    connected?: (params: ElementCallback<T>) => void;
    disconnected?: (params: ElementCallback<T>) => void;
}

export interface ListenerParams<S> {
    newValue: S;
    oldValue: S;
}

export function compute<S, R>(
    signal: Signal<S>,
    computeFn: (state: S) => R
): Signal<R> {
    return preactComputed(() => computeFn(signal.value));
}

export function cmp<T extends HTMLElement = HTMLElement, S = any, C = {}, A = {}>({
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

        private renderDisposer?: ReturnType<typeof uRender>;
        private listenerDisposer?: ReturnType<typeof effect>;
        private currentValue?: S;

        static get observedAttributes() {
            return observedAttributes;
        }

        connectedCallback() {
            try {
                const element = this as unknown as T;
                connected?.({ element });

                requestAnimationFrame(() => {
                    this.collectSlots();
                    this.doRender(element)
                });

            } catch (error) {
                console.error(`Error in ${tagName} connectedCallback:`, error);
            }
        }

        private collectSlots() {
            const defaultSlot: Node[] = [];
            const namedSlots: Record<string, Node[]> = {};
            const childNodes = this.childNodes ?? [];

            Array.from(childNodes).forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const slotName = (node as HTMLElement).getAttribute('data-slot');
                    if (slotName) {
                        if (!namedSlots[slotName]) {
                            namedSlots[slotName] = [];
                        }
                        namedSlots[slotName].push(node);
                    } else {
                        defaultSlot.push(node);
                    }
                } else {
                    defaultSlot.push(node);
                }
            });

            this.slotContent = { ...namedSlots, default: defaultSlot };
        }

        private doRender(element: HTMLElement) {
            if (render) {
                const renderFn = () => {
                    return render.bind(this)({
                        state: state?.value ?? ({} as unknown as S),
                        computed,
                        actions,
                        slots: this.slotContent,
                    });
                };
                this.renderDisposer = uRender(element, renderFn);
            }

            if (state && listen) {
                this.currentValue = state.value;
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
        }

        disconnectedCallback() {
            if (this.renderDisposer && typeof this.renderDisposer === 'function') {
                this.renderDisposer();
            }

            if (this.listenerDisposer && typeof this.listenerDisposer === 'function') {
                this.listenerDisposer();
            }

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
