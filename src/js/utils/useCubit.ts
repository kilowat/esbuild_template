import { render } from "lit-html/lit-html";

export type StateListener<T> = (state: T) => void;
export type BuildWhen<T> = (prevState: T, nextState: T) => boolean;
export type ListenWhen<T> = (prevState: T, nextState: T) => boolean;

export function useCubit<T>(initialState: T) {
    let _state = initialState;
    let _prevState = initialState;
    const _listeners = new Set<{
        listener?: StateListener<T>;
        build?: (state: T) => unknown;
        element?: HTMLElement;
        buildWhen?: BuildWhen<T>;
        listenWhen?: ListenWhen<T>;
        autoUnsubscribe?: boolean;
    }>();

    function emit(newState: Partial<T> | T): void {
        _prevState = _state;

        // Handle state update for objects and primitive types
        if (typeof _state === "object" && _state !== null && typeof newState === "object") {
            _state = { ..._state, ...newState } as T;
        } else {
            _state = newState as T;
        }

        // Notify listeners
        _listeners.forEach(({ listener, build, element, buildWhen, listenWhen }) => {
            const shouldBuild = build && element && (!buildWhen || buildWhen(_prevState, _state));
            const shouldListen = listener && (!listenWhen || listenWhen(_prevState, _state));

            if (shouldBuild) {
                render(build(_state), element);
            }

            if (shouldListen) {
                listener(_state);
            }
        });
    }

    function _subscribe(
        listener?: StateListener<T>,
        build?: (state: T) => unknown,
        element?: HTMLElement,
        buildWhen?: BuildWhen<T>,
        listenWhen?: ListenWhen<T>,
    ): () => void {
        const entry = { listener, build, element, buildWhen, listenWhen };
        _listeners.add(entry);

        const shouldBuild = build && element && (!buildWhen || buildWhen(_prevState, _state));
        const shouldListen = listener && (!listenWhen || listenWhen(_prevState, _state));

        if (shouldBuild) {
            render(build(_state), element);
        }

        if (shouldListen) {
            listener(_state);
        }

        return () => {
            _listeners.delete(entry);
        };
    }

    return {
        get state() {
            return _state;
        },

        get prevState() {
            return _prevState;
        },

        emit,
        _subscribe
    };
}

export type CubitType<T> = ReturnType<typeof useCubit<T>>;

export function Consumer<T>({
    cubit,
    element,
    build,
    buildWhen,
    listener,
    listenWhen,
}: {
    cubit: CubitType<T>;
    listener?: StateListener<Readonly<T>>;
    element?: HTMLElement;
    build?: (state: Readonly<T>) => unknown;
    buildWhen?: BuildWhen<Readonly<T>>;
    listenWhen?: ListenWhen<Readonly<T>>;
}): () => void {
    // Add automatic unsubscription by default
    return cubit._subscribe(
        listener,
        build,
        element,
        buildWhen,
        listenWhen,
    );
}