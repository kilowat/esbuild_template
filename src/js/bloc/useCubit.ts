type StateListener<T> = (state: T) => void;
type StateComparer<T> = (prev: T, next: T) => boolean;
type ComputedFn<T> = () => T;

interface ListenerEntry<T> {
    id: number;
    listener?: StateListener<T>;
    build?: (state: T) => unknown;
    buildWhen?: StateComparer<T>;
    listenWhen?: StateComparer<T>;
    element?: HTMLElement;
}

interface ComputedValue<T> {
    value: T;
    isDirty: boolean;
    dependencies: Set<unknown>;
}

export function useCubit<T>(initialState: T) {
    let state = initialState;
    let prevState = initialState;
    let nextListenerId = 0;

    // Используем WeakMap для элементов
    const elementSubscriptions = new WeakMap<HTMLElement, () => void>();

    // Храним обычные подписки в Map
    const listeners = new Map<number, ListenerEntry<T>>();

    // Кэш для вычисляемых значений
    const computedValues = new Map<ComputedFn<unknown>, ComputedValue<unknown>>();

    let pendingUpdates: Array<Partial<T>> = [];
    let isUpdateScheduled = false;
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

    // Функция для создания вычисляемых значений
    function computed<R>(fn: ComputedFn<R>) {
        let computedValue = computedValues.get(fn) as ComputedValue<R> | undefined;

        if (!computedValue) {
            computedValue = {
                value: fn(),
                isDirty: true,
                dependencies: new Set()
            };
            computedValues.set(fn, computedValue);
        }

        if (computedValue.isDirty) {
            computedValue.value = fn();
            computedValue.isDirty = false;
        }

        return computedValue.value;
    }

    // Пометить все вычисляемые значения как грязные
    function markComputedDirty() {
        for (const computed of computedValues.values()) {
            computed.isDirty = true;
        }
    }

    function applyUpdates() {
        if (pendingUpdates.length === 0) return;

        prevState = state;

        const finalUpdate = pendingUpdates.reduce((acc, update) => {
            if (typeof state === 'object' && state !== null && typeof update === 'object') {
                return { ...acc, ...update };
            }
            return update;
        }, {} as Partial<T>);

        if (typeof state === 'object' && state !== null && typeof finalUpdate === 'object') {
            state = { ...state, ...finalUpdate } as T;
        } else {
            state = finalUpdate as T;
        }

        pendingUpdates = [];
        isUpdateScheduled = false;
        updatePromise = null;

        // Помечаем все вычисляемые значения как грязные
        markComputedDirty();

        const entries = Array.from(listeners.values());
        for (const entry of entries) {
            const { listener, build, buildWhen, listenWhen, element } = entry;

            const shouldBuild = build && (!buildWhen || buildWhen(prevState, state));
            const shouldListen = listener && (!listenWhen || listenWhen(prevState, state));

            if (shouldBuild) build(state);
            if (shouldListen) listener(state);

            // Если есть элемент, обновляем его подписку в WeakMap
            if (element) {
                const unsubscribe = () => {
                    listeners.delete(entry.id);
                };
                elementSubscriptions.set(element, unsubscribe);
            }
        }
    }

    function emit(update: Partial<T> | T): void {
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

        // Если есть элемент, сохраняем функцию отписки в WeakMap
        if (element) {
            const unsubscribe = () => {
                listeners.delete(id);
                elementSubscriptions.delete(element);
            };
            elementSubscriptions.set(element, unsubscribe);
        }

        if (listener && (!listenWhen || listenWhen(prevState, state))) {
            listener(state);
        }
        if (build && (!buildWhen || buildWhen(prevState, state))) {
            build(state);
        }

        return () => {
            listeners.delete(id);
            if (element) {
                elementSubscriptions.delete(element);
            }
        };
    }

    return {
        get state() { return state; },
        get prevState() { return prevState; },
        emit,
        subscribe,
        computed
    };
}

export type CubitType<T> = ReturnType<typeof useCubit<T>>;