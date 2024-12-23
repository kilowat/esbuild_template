type StateListener<T> = (state: T) => void;
type StateComparer<T> = (prev: T, next: T) => boolean;

interface ListenerEntry<T> {
    id: number;
    listener?: StateListener<T>;
    build?: (state: T) => unknown;
    buildWhen?: StateComparer<T>;
    listenWhen?: StateComparer<T>;
    element?: HTMLElement;
}

export function useCubit<T>(initialState: T) {
    let state = initialState;
    let prevState = initialState;
    let nextListenerId = 0;

    // Используем Map вместо Set для более быстрого доступа и удаления
    const listeners = new Map<number, ListenerEntry<T>>();

    // Очередь обновлений для батчинга
    let pendingUpdates: Array<Partial<T>> = [];
    let isUpdateScheduled = false;

    // Кэш для промиса микротаски
    let updatePromise: Promise<void> | null = null;

    // Оптимизированное сравнение объектов
    const hasChanged = (a: T, b: T): boolean => {
        if (a === b) return false;
        if (typeof a !== 'object' || typeof b !== 'object') return true;
        if (!a || !b) return true;

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return true;

        for (const key of keysA) {
            if (!(key in b) || a[key as keyof T] !== b[key as keyof T]) {
                return true;
            }
        }

        return false;
    };

    // Оптимизированное применение обновлений
    function applyUpdates() {
        if (pendingUpdates.length === 0) return;

        prevState = state;

        // Объединяем все обновления в одно
        const finalUpdate = pendingUpdates.reduce((acc, update) => {
            if (typeof state === 'object' && state !== null && typeof update === 'object') {
                return { ...acc, ...update };
            }
            return update;
        }, {} as Partial<T>);

        // Применяем обновление
        if (typeof state === 'object' && state !== null && typeof finalUpdate === 'object') {
            state = { ...state, ...finalUpdate } as T;
        } else {
            state = finalUpdate as T;
        }

        // Очищаем очередь
        pendingUpdates = [];
        isUpdateScheduled = false;
        updatePromise = null;

        // Уведомляем слушателей
        const entries = Array.from(listeners.values());
        for (const entry of entries) {
            const { listener, build, buildWhen, listenWhen } = entry;

            const shouldBuild = build && (!buildWhen || buildWhen(prevState, state));
            const shouldListen = listener && (!listenWhen || listenWhen(prevState, state));

            if (shouldBuild) build(state);
            if (shouldListen) listener(state);
        }
    }

    function emit(update: Partial<T> | T): void {
        // Проверяем, есть ли реальные изменения
        if (typeof update === 'object' && !hasChanged(state, { ...state, ...update })) {
            return;
        }

        pendingUpdates.push(update);

        if (!isUpdateScheduled) {
            isUpdateScheduled = true;
            updatePromise = updatePromise || Promise.resolve().then(applyUpdates);
        }
    }

    function subscribe(
        listener?: StateListener<T>,
        build?: (state: T) => unknown,
        element?: HTMLElement,
        buildWhen?: StateComparer<T>,
        listenWhen?: StateComparer<T>
    ): () => void {
        const id = nextListenerId++;
        const entry = { id, listener, build, element, buildWhen, listenWhen };
        listeners.set(id, entry);

        // Уведомляем о текущем состоянии при подписке
        if (listener && (!listenWhen || listenWhen(prevState, state))) {
            listener(state);
        }
        if (build && (!buildWhen || buildWhen(prevState, state))) {
            build(state);
        }

        return () => {
            listeners.delete(id);
        };
    }

    return {
        get state() { return state; },
        get prevState() { return prevState; },
        emit,
        subscribe,
    };
}

export type CubitType<T> = ReturnType<typeof useCubit<T>>;