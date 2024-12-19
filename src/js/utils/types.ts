import { TypedHTMLElement } from "./component";

// types.ts
export type Provider<T> = {
    token: symbol;
    factory: () => T;
};

export type ProviderConfig<T> = {
    provider: Provider<T>;
    create: () => T;
    lazy?: boolean;
};

export type ComponentConfig = {
    providers?: Array<ProviderConfig<any>>;
    connect?: (element: TypedHTMLElement) => void | (() => void);
    disconnect?: (element: TypedHTMLElement) => void;
    render?: (element: TypedHTMLElement) => unknown | (() => void);
};