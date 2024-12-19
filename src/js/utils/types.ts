import { TypedHTMLElement } from "./component";

export type Provider<T> = {
    type: new (...args: any[]) => T;
    create: () => T;
    lazy?: boolean;
}

export interface ComponentConfig {
    connect?: (element: TypedHTMLElement) => void;
    disconnect?: (element: TypedHTMLElement) => void;
    render?: (element: TypedHTMLElement) => unknown;
    providers?: Array<Provider<any>>;
}