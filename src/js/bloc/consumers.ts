import { render } from "lit-html/lit-html";
import { CubitType } from "./useCubit";

// Base types
export interface ElementCallback<T, E extends HTMLElement> {
    state: Readonly<T>;
    element: E;
}

export interface StateChangeCallback<T, E extends HTMLElement> {
    prevState: Readonly<T>;
    nextState: Readonly<T>;
    element: E;
}

export interface ElementOnlyCallback<E extends HTMLElement> {
    element: E;
}

export interface AttributeChangeCallback<E extends HTMLElement> {
    element: E;
    name: string;
    oldValue: string | null;
    newValue: string | null;
}

// Common props interface
export interface BaseConsumerProps<T, E extends HTMLElement> {
    cubit?: CubitType<T>;
    build?: (params: ElementCallback<T, E>) => unknown;
    buildWhen?: (params: StateChangeCallback<T, E>) => boolean;
    listener?: (params: ElementCallback<T, E>) => void;
    listenWhen?: (params: StateChangeCallback<T, E>) => boolean;
    connected?: (params: ElementOnlyCallback<E>) => void;
    disconnected?: (params: ElementOnlyCallback<E>) => void;
}

// Helper functions
function createCubitSubscription<T, E extends HTMLElement>({
    cubit,
    element,
    build,
    buildWhen,
    listener,
    listenWhen,
}: BaseConsumerProps<T, E> & { element: E }) {
    if (!cubit) return;

    return cubit.subscribe(
        listener ? (state) => listener({ state, element }) : undefined,
        build ? (state) => {
            const result = build({ state, element });
            render(result, element);
        } : undefined,
        element,
        buildWhen ? (prevState, nextState) =>
            buildWhen({ prevState, nextState, element }) : undefined,
        listenWhen ? (prevState, nextState) =>
            listenWhen({ prevState, nextState, element }) : undefined
    );
}

function renderInitialBuild<T, E extends HTMLElement>(
    build: ((params: ElementCallback<T, E>) => unknown) | undefined,
    element: E
) {
    if (!build) return;

    const initialState = {} as T;
    const result = build({ state: initialState, element });
    render(result, element);
}

// Component Consumer
export function ComponentConsumer<T, E extends HTMLElement = HTMLElement>({
    cubit,
    tagName,
    build,
    buildWhen,
    listener,
    listenWhen,
    connected,
    disconnected,
    attributeChanged,
    observedAttributes = []
}: BaseConsumerProps<T, E> & {
    tagName: string;
    attributeChanged?: (params: AttributeChangeCallback<E>) => void;
    observedAttributes?: string[];
}): void {
    if (customElements.get(tagName)) return;

    class CustomElement extends HTMLElement {
        private unsubscribe?: () => void;

        static get observedAttributes() {
            return observedAttributes;
        }

        connectedCallback() {
            const element = this as unknown as E;
            connected?.({ element });

            if (cubit) {
                this.unsubscribe = createCubitSubscription({
                    cubit, element, build, buildWhen, listener, listenWhen
                });
            } else {
                renderInitialBuild(build, element);
            }
        }

        disconnectedCallback() {
            this.unsubscribe?.();
            disconnected?.({ element: this as unknown as E });
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
            attributeChanged?.({
                element: this as unknown as E,
                name,
                oldValue,
                newValue
            });
        }
    }

    customElements.define(tagName, CustomElement);
}

// Query Consumer
export function QueryConsumer<T, E extends HTMLElement = HTMLElement>({
    cubit,
    query,
    build,
    buildWhen,
    listener,
    listenWhen,
    connected,
    disconnected,
}: BaseConsumerProps<T, E> & {
    query: () => E | E[] | NodeListOf<E> | null;
}): () => void {
    const unsubscribes: Array<() => void> = [];
    let elements: E[] = [];

    function handleElements(queryResult: E | E[] | NodeListOf<E>) {
        elements = Array.isArray(queryResult) || queryResult instanceof NodeList
            ? Array.from(queryResult)
            : [queryResult];

        if (elements.length === 0) {
            console.warn('No elements found for QueryConsumer');
            return;
        }

        elements.forEach(element => {
            connected?.({ element });

            if (cubit) {
                const unsubscribe = createCubitSubscription({
                    cubit, element, build, buildWhen, listener, listenWhen
                });
                if (unsubscribe) unsubscribes.push(unsubscribe);
            } else {
                renderInitialBuild(build, element);
            }
        });
    }

    function initializeSubscription() {
        const queryResult = query();
        if (!queryResult) {
            console.warn('No elements found for QueryConsumer');
            return;
        }

        handleElements(queryResult);
    }

    // Initialize based on document ready state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSubscription);
    } else {
        initializeSubscription();
    }

    // Cleanup function
    return () => {
        unsubscribes.forEach(unsubscribe => unsubscribe());
        elements.forEach(element => disconnected?.({ element }));
        document.removeEventListener('DOMContentLoaded', initializeSubscription);

        unsubscribes.length = 0;
        elements.length = 0;
    };
}