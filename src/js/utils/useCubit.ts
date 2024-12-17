import { render } from "lit-html/lit-html";

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
            if (!buildWhen || buildWhen(_prevState, _state)) {
                listener(_state);
            }

            return () => {
                _listeners.delete(entry);
            };
        }
    };
}
export type Cubit<T> = ReturnType<typeof useCubit<T>>;

export function listenCubit<T>({
    cubit,
    listener,
    buildWhen,
}: {
    cubit: Cubit<T>;
    listener: StateListener<T>;
    buildWhen?: BuildWhen<T>;
}): () => void {
    return (cubit as any)._subscribe(listener, buildWhen);
}

export function renderCubit<T>({
    cubit,
    element,
    build,
    buildWhen,
}: {
    cubit: Cubit<T>,
    element: HTMLElement;
    build: StateListener<T>;
    buildWhen?: BuildWhen<T>;
}): () => void {
    return (cubit as any)._subscribe(() => {
        render(build(cubit.state), element);
    }, buildWhen);
}