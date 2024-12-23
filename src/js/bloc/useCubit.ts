export type StateListener<T> = (state: T) => void;
export type StateComparer<T> = (prev: T, next: T) => boolean;

interface ListenerEntry<T> {
    listener?: StateListener<T>;
    build?: (state: T) => unknown;
    buildWhen?: StateComparer<T>;
    listenWhen?: StateComparer<T>;
    element?: HTMLElement;
}

export function useCubit<T>(initialState: T) {
    let state = initialState;
    let prevState = initialState;
    const listeners = new Set<ListenerEntry<T>>();
    let batchedUpdates: Partial<T> | null = null;
    let updateScheduled = false;

    function notifyListener(entry: ListenerEntry<T>, prev: T, current: T) {
        const { listener, build, buildWhen, listenWhen } = entry;

        const shouldBuild = build && (!buildWhen || buildWhen(prev, current));
        const shouldListen = listener && (!listenWhen || listenWhen(prev, current));

        if (shouldBuild) build(current);
        if (shouldListen) listener(current);
    }

    function applyUpdates() {
        if (batchedUpdates === null) return;

        prevState = state;

        if (typeof state === "object" && state !== null && typeof batchedUpdates === "object") {
            state = { ...state, ...batchedUpdates } as T;
        } else {
            state = batchedUpdates as T;
        }

        batchedUpdates = null;

        listeners.forEach(entry => notifyListener(entry, prevState, state));

        updateScheduled = false;
    }

    function emit(update: Partial<T> | T): void {
        if (typeof state === "object" && state !== null && typeof update === "object") {
            batchedUpdates = batchedUpdates ? { ...batchedUpdates, ...update } : update;
        } else {
            batchedUpdates = update as T;
        }

        if (!updateScheduled) {
            updateScheduled = true;
            Promise.resolve().then(applyUpdates);
        }
    }

    function subscribe(
        listener?: StateListener<T>,
        build?: (state: T) => unknown,
        element?: HTMLElement,
        buildWhen?: StateComparer<T>,
        listenWhen?: StateComparer<T>
    ): () => void {
        const entry = { listener, build, element, buildWhen, listenWhen };
        listeners.add(entry);

        // Уведомляем о текущем состоянии при подписке
        notifyListener(entry, prevState, state);

        return () => listeners.delete(entry);
    }

    return {
        get state() { return state; },
        get prevState() { return prevState; },
        emit,
        subscribe,
    };
}

export type CubitType<T> = ReturnType<typeof useCubit<T>>;