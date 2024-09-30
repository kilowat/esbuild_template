import { PubSub } from '@symbiotejs/symbiote';


type StateListener<T> = (state: T) => void;

export class Cubit<T> {
    private _state: T;
    private pubsub;

    constructor(initialState: T) {
        this._state = initialState;
        this.pubsub = PubSub.registerCtx({ state: this._state });
    }

    get state(): T {
        return this._state;
    }

    // Метод для обновления состояния
    emit(newState: T): void {
        this._state = newState;
        this.pubsub.pub('state', this._state);
    }

    subscribe(listener: StateListener<T>) {
        this.pubsub.sub('state', (state) => listener(state as T));
    }

    dispose(): void {
        PubSub.deleteCtx(this.pubsub.uid);
    }
}