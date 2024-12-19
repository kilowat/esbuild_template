// Define base types for type inference

import { Provider } from "./types";


// Create helper for defining providers
export const createProvider = <T>(): Provider<T> => ({
    token: Symbol(),
    factory: null as any
});

const createContext = () => {
    const providers = new Map<symbol, () => any>();
    const globalInstances = new Map<symbol, any>();
    const localInstances = new WeakMap<HTMLElement, Map<symbol, any>>();

    const provide = <T>(provider: Provider<T>, factory: () => T): void => {
        providers.set(provider.token, factory);
        // Создаем глобальный инстанс сразу
        const instance = factory();
        globalInstances.set(provider.token, instance);
    };

    const read = <T>(element: HTMLElement, provider: Provider<T>): T => {
        const token = provider.token;

        // Проверяем локальные инстансы
        const localMap = localInstances.get(element);
        if (localMap?.has(token)) {
            return localMap.get(token) as T;
        }

        // Проверяем глобальные инстансы
        if (globalInstances.has(token)) {
            return globalInstances.get(token) as T;
        }

        // Находим провайдер и создаем инстанс
        const factory = providers.get(token);
        if (!factory) {
            throw new Error(`No provider found for the requested token.`);
        }

        const instance = factory();

        // Сохраняем инстанс
        if (element.hasAttribute('local-provider')) {
            const localMap = localInstances.get(element) || new Map();
            localMap.set(token, instance);
            localInstances.set(element, localMap);
        } else {
            globalInstances.set(token, instance);
        }

        return instance;
    };

    const dispose = (element: HTMLElement): void => {
        localInstances.delete(element);
    };

    return { provide, read, dispose };
};

export const globalContext = createContext();
