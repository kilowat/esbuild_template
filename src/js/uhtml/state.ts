import { Signal, signal as createSignal, computed as preactComputed } from '@preact/signals-core';

type UnwrapSignal<T> = T extends Signal<infer U> ? U : T;

type ComputedProps<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any
    ? ReturnType<T[K]>
    : UnwrapSignal<T[K]>
};

type ComputedResult<T> = {
    value: T;
    valueOf: () => T;
    toString: () => string;
};

function cloneDeep<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(cloneDeep) as unknown as T;
    }

    const clonedObj: Record<PropertyKey, any> = {};
    for (const key of Reflect.ownKeys(obj)) {
        clonedObj[key as keyof typeof obj] = cloneDeep((obj as Record<PropertyKey, any>)[key]);
    }

    return clonedObj as T;
}

class EnhancedSignal<T> extends Signal<T> {
    emit(value: Partial<T> | T): void {
        if (typeof value === 'object' && value !== null && typeof this.value === 'object') {
            const currentClone = cloneDeep(this.value);
            this.value = { ...currentClone, ...value } as T;
        } else {
            this.value = value as T;
        }
    }
}

export function createState<T>(initialValue: T): EnhancedSignal<T> {
    const baseSignal = createSignal(initialValue);
    Object.setPrototypeOf(baseSignal, EnhancedSignal.prototype);
    return baseSignal as EnhancedSignal<T>;
}

export function compute<S, R>(
    signal: Signal<S>,
    computeFn: (state: S) => R
): ComputedResult<R> {
    const computedSignal = preactComputed(() => computeFn(signal.value));

    const result = {
        get value() {
            return computedSignal.value;
        },
        valueOf() {
            return computedSignal.value;
        },
        toString() {
            return String(computedSignal.value);
        }
    };

    return result;
}

export function createComputed<T extends Record<string, unknown>>(
    computedDefs: {
        [K in keyof T]: () => Signal<T[K]> | ComputedResult<T[K]>
    }
): ComputedProps<T> {
    const computed = {} as ComputedProps<T>;

    for (const key in computedDefs) {
        Object.defineProperty(computed, key, {
            get: () => {
                const result = computedDefs[key]();
                return 'value' in result ? result.value : result;
            },
            enumerable: true
        });
    }

    return computed;
}