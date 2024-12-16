export type StateListener<T> = (state: T) => void;

export type Cubit<T> = {
    prevState: T,
    state: T;
    emit: (newState: T) => void;
    subscribe: (listener: StateListener<T>, buildWhen?: (prevState: T, nextState: T) => boolean) => () => void;
};

export function useCubit<T>(initialState: T) {
    let _state = initialState;
    let _prevState = initialState;

    const listeners = new Set<{ listener: StateListener<T>; buildWhen?: (prevState: T, nextState: T) => boolean }>();

    function emit(newState: T): void {
        _prevState = _state;
        _state = newState;
        listeners.forEach(({ listener, buildWhen }) => {
            if (!buildWhen || buildWhen(_prevState, _state)) {
                listener(_state);
            }
        });
    }

    function subscribe(listener: StateListener<T>, buildWhen?: (prevState: T, nextState: T) => boolean): () => void {
        listeners.add({ listener, buildWhen });
        listener(_state);

        return () => {
            listeners.forEach((entry) => {
                if (entry.listener === listener) {
                    listeners.delete(entry);
                }
            });
        };
    }

    function copy(state: T, partialState: Partial<T>): T {
        return typeof state === 'object' && state !== null
            ? { ...state, ...partialState }
            : partialState as T;
    }

    return {
        get state(): T & { copy: (partialState: Partial<T>) => T } {
            if (typeof _state === 'object' && _state !== null) {
                return Object.assign({}, _state, {
                    copy: (partialState: Partial<T>) => copy(_state, partialState)
                });
            }
            return _state as T & { copy: (partialState: Partial<T>) => T };
        },
        get prevState(): T {
            return _prevState;
        },
        emit,
        subscribe,
    };
}