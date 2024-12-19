import { render } from "lit-html/lit-html";

export type StateListener<T> = ({ state }: { state: T }) => void;
export type BuildWhen<T> = ({ prevState, nextState }: { prevState: T; nextState: T }) => boolean;
export type ListenWhen<T> = ({ prevState, nextState }: { prevState: T; nextState: T }) => boolean;

export abstract class Cubit<T> {
    protected _state: T;
    protected _prevState: T;
    protected _listeners: Set<{
        listener?: StateListener<T>;
        build?: (state: { state: T }) => unknown;
        element?: HTMLElement;
        buildWhen?: BuildWhen<T>;
        listenWhen?: ListenWhen<T>;
    }>;

    constructor(initialState: T) {
        this._state = initialState;
        this._prevState = initialState;
        this._listeners = new Set();
    }

    get state(): Readonly<T> {
        return this._state;
    }

    get prevState(): T {
        return this._prevState;
    }

    public emit(newState: Partial<T> | T): void {
        this._prevState = this._state;

        // Handle state update for objects and primitive types
        if (typeof this._state === "object" && this._state !== null && typeof newState === "object") {
            this._state = { ...this._state, ...newState } as T;
        } else {
            this._state = newState as T;
        }

        // Notify listeners
        this._listeners.forEach(({ listener, build, element, buildWhen, listenWhen }) => {
            const shouldBuild = build && element && (!buildWhen || buildWhen({ prevState: this._prevState, nextState: this._state }));
            const shouldListen = listener && (!listenWhen || listenWhen({ prevState: this._prevState, nextState: this._state }));

            if (shouldBuild) {
                render(build({ state: this._state }), element);
            }

            if (shouldListen) {
                listener({ state: this._state });
            }
        });
    }

    protected _subscribe(
        listener?: StateListener<T>,
        build?: (state: { state: T }) => unknown,
        element?: HTMLElement,
        buildWhen?: BuildWhen<T>,
        listenWhen?: ListenWhen<T>,
    ): () => void {
        const entry = { listener, build, element, buildWhen, listenWhen };
        this._listeners.add(entry);

        const shouldBuild = build && element && (!buildWhen || buildWhen({ prevState: this._prevState, nextState: this._state }));
        const shouldListen = listener && (!listenWhen || listenWhen({ prevState: this._prevState, nextState: this._state }));

        if (shouldBuild) {
            render(build({ state: this._state }), element);
        }

        if (shouldListen) {
            listener({ state: this._state });
        }

        return () => {
            this._listeners.delete(entry);
        };
    }
}

export function Consumer<T>({
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
    build?: (state: { state: Readonly<T> }) => unknown;
    buildWhen?: BuildWhen<Readonly<T>>;
    listenWhen?: ListenWhen<Readonly<T>>;
}): () => void {
    return cubit['_subscribe'](
        listener,
        build,
        element,
        buildWhen,
        listenWhen,
    );
}