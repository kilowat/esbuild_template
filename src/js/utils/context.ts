// Define base types for type inference

import { Provider } from "./types";


// Create helper for defining providers
export const createProvider = <T>(): Provider<T> => ({
    token: Symbol(),
    factory: null as any
});

// Updated context creation
const createContext = () => {
    const providers = new Map<symbol, () => any>();
    const globalInstances = new Map<symbol, any>();
    const localInstances = new WeakMap<HTMLElement, Map<symbol, any>>();

    const provide = <T>(provider: Provider<T>, factory: () => T): void => {
        provider.factory = factory;
        providers.set(provider.token, factory);
    };

    const read = <T>(element: HTMLElement, provider: Provider<T>): T => {
        const token = provider.token;

        // Check local instances
        const localMap = localInstances.get(element);
        if (localMap?.has(token)) {
            return localMap.get(token) as T;
        }

        // Check global instances
        if (globalInstances.has(token)) {
            return globalInstances.get(token) as T;
        }

        // Find provider
        const factory = providers.get(token);
        if (!factory) {
            throw new Error(
                `No provider found for the requested token. Ensure the provider is registered with provide().`
            );
        }

        // Create new instance
        const instance = factory();

        // Save instance either globally or locally
        if (element.hasAttribute('local-provider')) {
            const localMap = localInstances.get(element) || new Map();
            localMap.set(token, instance);
            localInstances.set(element, localMap);
        } else {
            globalInstances.set(token, instance);
        }

        return instance as T;
    };

    const dispose = (element: HTMLElement): void => {
        localInstances.delete(element);
    };

    return { provide, read, dispose };
};

export const globalContext = createContext();