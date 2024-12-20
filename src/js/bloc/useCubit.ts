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
        buildWhen?: BuildWhen<T>;
        listenWhen?: ListenWhen<T>;
    }>();

    function emit(newState: Partial<T> | T): void {
        _prevState = _state;

        if (typeof _state === "object" && _state !== null && typeof newState === "object") {
            _state = { ..._state, ...newState } as T;
        } else {
            _state = newState as T;
        }

        _listeners.forEach(({ listener, build, buildWhen, listenWhen }) => {
            const shouldBuild = build && (!buildWhen || buildWhen(_prevState, _state));
            const shouldListen = listener && (!listenWhen || listenWhen(_prevState, _state));

            if (shouldBuild) {
                build(_state);
            }

            if (shouldListen) {
                listener(_state);
            }
        });
    }

    function subscribe(
        listener?: StateListener<T>,
        build?: (state: T) => unknown,
        element?: HTMLElement,
        buildWhen?: BuildWhen<T>,
        listenWhen?: ListenWhen<T>
    ): () => void {
        const entry = { listener, build, element, buildWhen, listenWhen };
        _listeners.add(entry);

        const shouldBuild = build && element && (!buildWhen || buildWhen(_prevState, _state));
        const shouldListen = listener && (!listenWhen || listenWhen(_prevState, _state));

        if (shouldBuild) {
            build(_state);
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
        subscribe,
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
    element?: HTMLElement;
    build?: ({ state }: { state: Readonly<T>; }) => unknown;
    buildWhen?: ({
        prevState,
        nextState,
    }: {
        prevState: Readonly<T>;
        nextState: Readonly<T>;
    }) => boolean;
    listener?: ({ state }: { state: Readonly<T>; }) => void;
    listenWhen?: ({
        prevState,
        nextState,
    }: {
        prevState: Readonly<T>;
        nextState: Readonly<T>;
    }) => boolean;
}): () => void {
    return cubit.subscribe(
        listener
            ? (state) => listener({ state })
            : undefined,
        build
            ? (state) => {
                if (element) {
                    render(build({ state }), element)
                }
            }
            : undefined,
        element,
        buildWhen
            ? (prevState, nextState) => buildWhen({ prevState, nextState })
            : undefined,
        listenWhen
            ? (prevState, nextState) => listenWhen({ prevState, nextState })
            : undefined
    );
}
