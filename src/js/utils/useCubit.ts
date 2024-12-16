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

    type CopyableState = T extends object ? T & { copy: (partialState: Partial<T>) => T } : T;

    const stateProxy = typeof _state === 'object' && _state !== null
        ? new Proxy(_state as T & { copy?: (partialState: Partial<T>) => T }, {
            get(target, prop) {
                if (prop === 'copy' && typeof target === 'object' && target !== null) {
                    return (partialState: Partial<T>): T => ({ ...target, ...partialState });
                }
                return target[prop as keyof T];
            },
        })
        : _state;

    return {
        get state(): CopyableState {
            return stateProxy as CopyableState;
        },
        get prevState(): T {
            return _prevState;
        },
        emit,
        subscribe,
    };
}
