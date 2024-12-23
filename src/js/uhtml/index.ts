import { reactive } from 'uhtml/reactive';
import { Signal, effect, signal as createSignal } from '@preact/signals-core';

export { html } from 'uhtml/reactive';
export { htmlFor } from 'uhtml/keyed';
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

export function signal<T>(initialValue: T): EnhancedSignal<T> {
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

export interface BaseConsumerProps<T extends HTMLElement> {
    render?: () => (() => any) | any;
    connected?: (params: ElementCallback<T>) => void;
    disconnected?: (params: ElementCallback<T>) => void;
}

export function cmp<T extends HTMLElement = HTMLElement, S = any>({
    tagName,
    connected,
    render,
    disconnected,
    attributeChanged,
    observedAttributes = [],
    listen,
    signal,
}: BaseConsumerProps<T> & {
    tagName: string;
    attributeChanged?: (params: AttributeChangeCallback<T>) => void;
    observedAttributes?: string[];
    listen?: (params: { newValue: S; oldValue: S }) => void;
    signal?: Signal<S>;
}): void {
    if (customElements.get(tagName)) return;

    class CustomElement extends HTMLElement {
        private renderDisposer?: ReturnType<typeof uRender>;
        private listnerDiposer?: ReturnType<typeof effect>;
        private currentValue?: S;

        static get observedAttributes() {
            return observedAttributes;
        }

        connectedCallback() {
            const element = this as unknown as T;
            connected?.({ element });

            if (render) {
                const renderFn = render.bind(this);
                this.renderDisposer = uRender(element, renderFn);
            }

            if (signal && listen) {
                this.currentValue = signal.value;
                this.listnerDiposer = effect(() => {
                    const newValue = signal.value;
                    if (this.currentValue !== newValue) {
                        listen({ newValue, oldValue: this.currentValue! });
                        this.currentValue = newValue;
                    }
                });
            }
        }

        disconnectedCallback() {
            if (this.renderDisposer && typeof this.renderDisposer === 'function') {
                this.renderDisposer();
            }

            if (this.listnerDiposer && typeof this.listnerDiposer === 'function') {
                this.listnerDiposer();
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