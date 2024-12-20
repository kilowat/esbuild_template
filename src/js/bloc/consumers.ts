import { render } from "lit-html/lit-html";
import { CubitType } from "./useCubit";

type ElementCallback<T, E extends HTMLElement> = {
    state: Readonly<T>;
    element: E;
}

type StateChangeCallback<T, E extends HTMLElement> = {
    prevState: Readonly<T>;
    nextState: Readonly<T>;
    element: E;
}

type ElementOnlyCallback<E extends HTMLElement> = {
    element: E;
}

type AttributeChangeCallback<E extends HTMLElement> = {
    element: E;
    name: string;
    oldValue: string | null;
    newValue: string | null;
}

type BaseConsumerProps<T, E extends HTMLElement> = {
    cubit?: CubitType<T>;
    build?: (params: ElementCallback<T, E>) => unknown;
    buildWhen?: (params: StateChangeCallback<T, E>) => boolean;
    listener?: (params: ElementCallback<T, E>) => void;
    listenWhen?: (params: StateChangeCallback<T, E>) => boolean;
    connected?: (params: ElementOnlyCallback<E>) => void;
    disconnected?: (params: ElementOnlyCallback<E>) => void;
}

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
    if (customElements.get(tagName)) {
        return;
    }

    class CustomElement extends HTMLElement {
        private unsubscribe: (() => void) | undefined;

        static get observedAttributes() {
            return observedAttributes;
        }

        connectedCallback() {
            connected?.({ element: this as unknown as E });

            if (cubit) {
                this.unsubscribe = cubit.subscribe(
                    listener
                        ? (state) => listener({ state, element: this as unknown as E })
                        : undefined,
                    build
                        ? (state) => {
                            const result = build({ state, element: this as unknown as E });
                            render(result, this);
                        }
                        : undefined,
                    this as unknown as E,
                    buildWhen
                        ? (prevState, nextState) => buildWhen({
                            prevState,
                            nextState,
                            element: this as unknown as E
                        })
                        : undefined,
                    listenWhen
                        ? (prevState, nextState) => listenWhen({
                            prevState,
                            nextState,
                            element: this as unknown as E
                        })
                        : undefined
                );
            } else if (build) {
                const initialState = {} as T;
                const result = build({
                    state: initialState,
                    element: this as unknown as E
                });
                render(result, this);
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
    let unsubscribes: (() => void)[] = [];
    let elements: E[] = [];

    const initializeSubscription = () => {
        const queryResult = query();
        if (!queryResult) {
            console.warn('No elements found for QueryConsumer');
            return;
        }

        // Convert query result to array of elements
        elements = Array.isArray(queryResult) || queryResult instanceof NodeList
            ? Array.from(queryResult)
            : [queryResult];

        if (elements.length === 0) {
            console.warn('No elements found for QueryConsumer');
            return;
        }

        // Initialize each element
        elements.forEach(element => {
            connected?.({ element });

            if (cubit) {
                const unsubscribe = cubit.subscribe(
                    listener
                        ? (state) => listener({ state, element })
                        : undefined,
                    build
                        ? (state) => {
                            const result = build({ state, element });
                            render(result, element);
                        }
                        : undefined,
                    element,
                    buildWhen
                        ? (prevState, nextState) => buildWhen({
                            prevState,
                            nextState,
                            element
                        })
                        : undefined,
                    listenWhen
                        ? (prevState, nextState) => listenWhen({
                            prevState,
                            nextState,
                            element
                        })
                        : undefined
                );
                unsubscribes.push(unsubscribe);
            } else if (build) {
                // If no cubit but build function exists, render initial content
                const initialState = {} as T;
                const result = build({ state: initialState, element });
                render(result, element);
            }
        });
    };

    if (window && document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSubscription);
    } else {
        initializeSubscription();
    }

    return () => {
        // Cleanup all subscriptions
        unsubscribes.forEach(unsubscribe => unsubscribe());

        // Call disconnected callback for each element
        elements.forEach(element => {
            disconnected?.({ element });
        });

        if (window) {
            document.removeEventListener('DOMContentLoaded', initializeSubscription);
        }

        // Reset arrays
        unsubscribes = [];
        elements = [];
    };
}