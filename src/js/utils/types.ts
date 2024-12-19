import { TypedHTMLElement } from "./component";

export type Provider<T> = {
    token: symbol;
    factory: () => T;
};

export type ProviderConfig<T> = {
    provider: Provider<T>;
    create: () => T;
    lazy?: boolean;
};

// Updated component configuration type
export type ComponentConfig = {
    providers?: Array<ProviderConfig<any>>;
    connect?: (element: TypedHTMLElement) => void;
    disconnect?: (element: TypedHTMLElement) => void;
    render?: (element: TypedHTMLElement) => any;
};