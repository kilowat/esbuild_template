import { render } from "lit-html";

export type StateListener<T> = (state: T) => void;
export type BuildWhen<T> = (prevState: T, nextState: T) => boolean;
export type ListenWhen<T> = (prevState: T, nextState: T) => boolean;

export interface CubitActions<T> {
    emit: (newState: Partial<T> | T) => void;
    state: Readonly<T>;
    actions: Record<string, (payload?: any) => void>;
}

export function useCubit<T>({
    state: initialState,
    actions: initialActions = {},
    getters: initialGetters = {},
}: {
    state: T;
    actions?: Record<
        string,
        (params: {
            state: Readonly<T>;
            prevState: Readonly<T>;
            emit: (newState: Partial<T> | T) => void;
        },
            ...args: any[]
        ) => void>;
    getters?: Record<string, (params: { state: Readonly<T>; prevState: Readonly<T> }) => any>;
}) {
    let _state = initialState;
    let _prevState = initialState;
    const _listeners = new Set<{
        listener?: StateListener<T>;
        build?: (state: T) => unknown;
        element?: HTMLElement;
        buildWhen?: BuildWhen<T>;
        listenWhen?: ListenWhen<T>;
    }>();

    const emit = (newState: Partial<T> | T): void => {
        _prevState = _state;

        if (typeof _state === "object" && _state !== null && typeof newState === "object") {
            _state = { ..._state, ...newState } as T;
        } else {
            _state = newState as T;
        }

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
    };

    const actions: Record<string, (...args: any[]) => void> = {};
    for (const [key, action] of Object.entries(initialActions)) {
        actions[key] = (...args: any[]) => action({ state: _state, prevState: _prevState, emit }, ...args);
    }

    const getters = Object.fromEntries(
        Object.entries(initialGetters).map(([key, getter]) => [
            key,
            () => getter({ state: _state, prevState: _prevState }),
        ])
    );

    return {
        get state(): Readonly<T> {
            return _state;
        },
        get prevState(): Readonly<T> {
            return _prevState;
        },
        emit,
        actions,
        getters,
        _subscribe(
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
        },
    };
}

export interface Cubit<T> {
    state: Readonly<T>;
    prevState: Readonly<T>;
    emit: (newState: Partial<T> | T) => void;
    _subscribe(
        listener?: StateListener<T>,
        build?: (state: T) => unknown,
        element?: HTMLElement,
        buildWhen?: BuildWhen<T>,
        listenWhen?: ListenWhen<T>
    ): () => void;
    [key: string]: any; // Для поддержки действий и геттеров
}

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
    // Добавляем автоматическую отписку по умолчанию
    return (cubit as any)._subscribe(
        listener,
        build,
        element,
        buildWhen,
        listenWhen,
    );
}
