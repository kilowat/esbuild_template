const createContext = () => {
    // Храним фабрики и глобальные инстансы
    const providers = new Map<Function, () => any>();
    const globalInstances = new Map<Function, any>();
    const localInstances = new WeakMap<HTMLElement, Map<Function, any>>();

    const provide = <T>(type: Function, factory: () => T): void => {
        providers.set(type, factory);
    };

    const read = <T>(element: HTMLElement, type: Function): T => {
        // Проверяем локальные инстансы
        const localMap = localInstances.get(element);
        if (localMap?.has(type)) {
            return localMap.get(type) as T;
        }

        // Проверяем глобальные инстансы
        if (globalInstances.has(type)) {
            return globalInstances.get(type) as T;
        }

        // Ищем провайдер
        const factory = providers.get(type);
        if (!factory) {
            throw new Error(
                `No provider found for the requested type. Ensure the type is registered with provide().`
            );
        }

        // Создаем новый инстанс
        const instance = factory();

        // Сохраняем инстанс либо глобально, либо локально
        if (element.hasAttribute('local-provider')) {
            const localMap = localInstances.get(element) || new Map();
            localMap.set(type, instance);
            localInstances.set(element, localMap);
        } else {
            globalInstances.set(type, instance);
        }

        return instance as T;
    };

    const dispose = (element: HTMLElement): void => {
        localInstances.delete(element);
    };

    return { provide, read, dispose };
};

export const globalContext = createContext();
