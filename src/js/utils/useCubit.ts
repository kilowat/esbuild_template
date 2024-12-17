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
    }>();

    return {
        get state(): Readonly<T> {
            return _state;
        },
        get prevState(): T {
            return _prevState;
        },
        emit(newState: Partial<T> | T): void {
            _prevState = _state;

            if (typeof _state === "object" && _state !== null && typeof newState === "object") {
                _state = { ..._state, ...newState } as T;
            } else {
                _state = newState as T;
            }

            _listeners.forEach(({ listener, build, element, buildWhen, listenWhen }) => {
                // Отдельные условия для build и listener
                const shouldBuild = build && element && (!buildWhen || buildWhen(_prevState, _state));
                const shouldListen = listener && (!listenWhen || listenWhen(_prevState, _state));

                if (shouldBuild) {
                    render(build(_state), element);
                }

                if (shouldListen) {
                    listener(_state);
                }
            });
        },
        _subscribe(
            listener?: StateListener<T>,
            build?: (state: T) => unknown,
            element?: HTMLElement,
            buildWhen?: BuildWhen<T>,
            listenWhen?: ListenWhen<T>
        ): () => void {
            const entry = { listener, build, element, buildWhen, listenWhen };
            _listeners.add(entry);

            // Отдельные условия для build и listener при первоначальной подписке
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
    };
}

export type Cubit<T> = ReturnType<typeof useCubit<T>>;

export function consumer<T>({
    cubit,
    element,
    build,
    buildWhen,
    listener,
    listenWhen,
}: {
    cubit: Cubit<T>;
    listener?: StateListener<Readonly<T>>;
    element?: HTMLElement;
    build?: (state: Readonly<T>) => unknown;
    buildWhen?: BuildWhen<Readonly<T>>;
    listenWhen?: ListenWhen<Readonly<T>>;
}): () => void {
    return (cubit as any)._subscribe(
        listener,
        build,
        element,
        buildWhen,
        listenWhen
    );
}