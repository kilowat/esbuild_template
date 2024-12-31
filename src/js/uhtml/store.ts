import { compute, ComputedResult, createState, State } from "./state";

export interface StoreModule<S = any, C = any, A = any> {
    namespace?: string;
    state?: () => S;
    computed?: Record<string, (state: S) => any>;
    actions?: (context: { state: State<S>; computed: C }) => A;
}

export interface StoreInstance {
    state: Record<string, State<any>>;
    computed: Record<string, Record<string, ComputedResult<any>>>;
    actions: Record<string, Record<string, (...args: any[]) => any>>;
}

class Store {
    private static instance: Store;
    private store: StoreInstance = {
        state: {},
        computed: {},
        actions: {},
    };

    private constructor() { }

    static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        return Store.instance;
    }

    registerModule<S, C = any, A = any>(module: StoreModule<S, C, A>): void {
        const namespace = module.namespace || 'default';

        // Register state
        if (module.state) {
            if (!this.store.state[namespace]) {
                this.store.state[namespace] = createState(module.state());
            }
        }

        // Register computed
        if (module.computed) {
            this.store.computed[namespace] = {};
            for (const [key, computeFn] of Object.entries(module.computed)) {
                this.store.computed[namespace][key] = compute(
                    this.store.state[namespace],
                    computeFn as (state: any) => any
                );
            }
        }

        // Register actions
        if (module.actions) {
            this.store.actions[namespace] = {} as Record<string, (...args: any[]) => any>;
            const context = {
                state: this.store.state[namespace] as State<S>,
                computed: this.store.computed[namespace] as C
            };

            for (const [key, actionFn] of Object.entries(module.actions)) {
                this.store.actions[namespace][key] = actionFn(context);
            }
        }
    }

    getState<S>(namespace: string = 'default'): State<S> {
        return this.store.state[namespace];
    }

    getComputed<C>(namespace: string = 'default'): C {
        return this.store.computed[namespace] as C;
    }

    getActions<A>(namespace: string = 'default'): A {
        return this.store.actions[namespace] as A;
    }

    getStore(): StoreInstance {
        return this.store;
    }
}

export const createStore = Store.getInstance;