export type StateListener<T> = (state: T) => void;

// Определяем тип для cubit
export type Cubit<T> = {
    prevState: T,
    state: T;
    emit: (newState: T) => void;
    subscribe: (listener: StateListener<T>, buildWhen?: (prevState: T, nextState: T) => boolean) => () => void;
};

// Функция для создания Cubit
export function useCubit<T>(initialState: T) {
    let _state = initialState;
    let _prevState = initialState;
    const listeners = new Set<{ listener: StateListener<T>; buildWhen?: (prevState: T, nextState: T) => boolean }>();

    // Изменение состояния и оповещение подписчиков
    function emit(newState: T): void {
        _prevState = _state;
        _state = newState;
        listeners.forEach(({ listener, buildWhen }) => {
            if (!buildWhen || buildWhen(_prevState, _state)) {
                listener(_state);
            }
        });
    }

    // Подписка на изменения состояния с опциональной функцией buildWhen
    function subscribe(listener: StateListener<T>, buildWhen?: (prevState: T, nextState: T) => boolean): () => void {
        listeners.add({ listener, buildWhen });
        listener(_state); // Инициализируем слушателя текущим состоянием

        // Возвращаем функцию для отписки
        return () => {
            listeners.forEach((entry) => {
                if (entry.listener === listener) {
                    listeners.delete(entry);
                }
            });
        };
    }

    return {
        get state(): T {
            console.log(_state)
            return _state;
        },
        get prevState(): T {
            return _prevState;
        },
        emit,
        subscribe,
    };
}
