
type StateListener<T> = (state: T) => void;

// Определяем тип для cubit
export type Cubit<T> = {
    state: T;
    emit: (newState: T) => void;
    subscribe: (listener: (state: T) => void) => () => void;
};

export function useCubit<T>(initialState: T) {
    let state = initialState;
    const listeners = new Set<StateListener<T>>();
    // Изменение состояния и оповещение подписчиков
    function emit(newState: T): void {
        state = newState;
        listeners.forEach((listener) => listener(state));
    }

    // Подписка на изменения состояния
    function subscribe(listener: StateListener<T>): () => void {
        listeners.add(listener);
        listener(state); // Инициализируем слушателя текущим состоянием

        // Возвращаем функцию для отписки
        return () => {
            listeners.delete(listener);
        };
    }

    return {
        get state(): T {
            return state;
        },
        emit,
        subscribe,
    };
}
