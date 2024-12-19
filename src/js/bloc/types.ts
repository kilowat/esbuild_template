import { BlocHTMLElement } from "./component";

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
    connect?: (element: BlocHTMLElement) => void | (() => void);
    disconnect?: (element: BlocHTMLElement) => void;
    render?: (element: BlocHTMLElement) => unknown | (() => void);
};