export type StateListener<T> = (state: T) => void;
export type BuildWhen<T> = (prevState: T, nextState: T) => boolean;

export function useCubit<T>(initialState: T) {
    let _state = initialState;
    let _prevState = initialState;
    const _listeners = new Set<{
        listener: StateListener<T>;
        buildWhen?: BuildWhen<T>;
    }>();

    return {
        get state(): T {
            return _state;
        },
        get prevState(): T {
            return _prevState;
        },
        emit(newState: Partial<T> | T): void {
            _prevState = _state;

            // Создаем новый объект с полным spread
            if (typeof _state === "object" && _state !== null && typeof newState === "object") {
                _state = { ..._state, ...newState } as T;
            } else {
                _state = newState as T;
            }

            // Форсированное обновление через JSON parse/stringify
            if (typeof _state === "object" && _state !== null) {
                _state = JSON.parse(JSON.stringify(_state));
            }

            // Уведомляем всех подписчиков
            _listeners.forEach(({ listener, buildWhen }) => {
                if (!buildWhen || buildWhen(_prevState, _state)) {
                    listener(_state);
                }
            });
        },
        // Добавляем метод для подписки
        _subscribe(listener: StateListener<T>, buildWhen?: BuildWhen<T>): () => void {
            const entry = { listener, buildWhen };
            _listeners.add(entry);

            // Немедленный вызов листенера с текущим состоянием
            listener(_state);

            return () => {
                _listeners.delete(entry);
            };
        }
    };
}

export function listenCubit<T>(
    cubit: ReturnType<typeof useCubit<T>>,
    listener: StateListener<T>,
    buildWhen?: BuildWhen<T>
): () => void {
    // Используем внутренний метод _subscribe
    return (cubit as any)._subscribe(listener, buildWhen);
}