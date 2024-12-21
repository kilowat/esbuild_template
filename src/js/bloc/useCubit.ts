import { render } from "lit-html/lit-html";

// Core types
export type StateListener<T> = (state: T) => void;
export type StateComparer<T> = (prev: T, next: T) => boolean;

// Simple interfaces for internal use
interface ListenerEntry<T> {
    listener?: StateListener<T>;
    build?: (state: T) => unknown;
    buildWhen?: StateComparer<T>;
    listenWhen?: StateComparer<T>;
    element?: HTMLElement;
}

export function useCubit<T>(initialState: T) {
    let state = initialState;
    let prevState = initialState;
    const listeners = new Set<ListenerEntry<T>>();

    function emit(newState: Partial<T> | T): void {
        prevState = state;

        if (typeof state === "object" && state !== null && typeof newState === "object") {
            state = { ...state, ...newState } as T;
        } else {
            state = newState as T;
        }

        listeners.forEach(entry => {
            const { listener, build, buildWhen, listenWhen } = entry;

            const shouldBuild = build && (!buildWhen || buildWhen(prevState, state));
            const shouldListen = listener && (!listenWhen || listenWhen(prevState, state));

            if (shouldBuild) build(state);
            if (shouldListen) listener(state);
        });
    }

    function subscribe(
        listener?: StateListener<T>,
        build?: (state: T) => unknown,
        element?: HTMLElement,
        buildWhen?: StateComparer<T>,
        listenWhen?: StateComparer<T>
    ): () => void {
        const entry = { listener, build, element, buildWhen, listenWhen };
        listeners.add(entry);

        // Initial notification
        const shouldBuild = build && (!buildWhen || buildWhen(prevState, state));
        const shouldListen = listener && (!listenWhen || listenWhen(prevState, state));

        if (shouldBuild) build(state);
        if (shouldListen) listener(state);

        return () => listeners.delete(entry);
    }

    return {
        get state() { return state; },
        get prevState() { return prevState; },
        emit,
        subscribe,
    };
}

export type CubitType<T> = ReturnType<typeof useCubit<T>>;

// Props interface for Consumer
export interface ConsumerProps<T> {
    cubit: CubitType<T>;
    element?: HTMLElement;
    build?: (props: { state: T }) => unknown;
    buildWhen?: (props: { prevState: T; nextState: T }) => boolean;
    listener?: (props: { state: T }) => void;
    listenWhen?: (props: { prevState: T; nextState: T }) => boolean;
}

export function Consumer<T>({
    cubit,
    element,
    build,
    buildWhen,
    listener,
    listenWhen,
}: ConsumerProps<T>): () => void {
    return cubit.subscribe(
        listener ? (state) => listener({ state }) : undefined,
        build ? (state) => element && render(build({ state }), element) : undefined,
        element,
        buildWhen ? (prev, next) => buildWhen({ prevState: prev, nextState: next }) : undefined,
        listenWhen ? (prev, next) => listenWhen({ prevState: prev, nextState: next }) : undefined
    );
}