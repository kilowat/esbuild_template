import { html, render } from "lit-html/lit-html";
import { Consumer } from "./cubit";

type WebComponentAttributes = {
    observedAttributes?: string[];
    defaultAttributes?: Record<string, any>;
};

type RenderResult = ReturnType<typeof html> | ReturnType<typeof Consumer>;

type ComponentLifecycle = {
    construct?: () => void;
    connect?: ({ element }: { element: ExtendedHTMLElement }) => void;
    disconnect?: ({ element }: { element: ExtendedHTMLElement }) => void;
    render?: ({ element }: { element: ExtendedHTMLElement }) => RenderResult;
    attributeChanged?: ({
        name,
        oldValue,
        newValue,
        element
    }: {
        name: string;
        oldValue: string | null;
        newValue: string | null;
        element: ExtendedHTMLElement;
    }) => void;
    adoptedCallback?: ({
        oldDocument,
        newDocument
    }: {
        oldDocument: Document;
        newDocument: Document;
    }) => void;
};

interface ExtendedHTMLElement extends HTMLElement {
    addDisconnectHandler(handler: () => void): void;
    rerender?(): void;
    _unsubscribeState?: () => void;
}

export const createComponent = (
    tagName: string,
    lifecycle: ComponentLifecycle = {},
    options: WebComponentAttributes = {}
) => {
    const {
        observedAttributes = [],
        defaultAttributes = {}
    } = options;

    const Component = class extends HTMLElement implements ExtendedHTMLElement {
        static get observedAttributes() {
            return observedAttributes;
        }

        private disconnectHandler?: () => void;
        _unsubscribeState?: () => void;

        constructor() {
            super();

            Object.keys(defaultAttributes).forEach(key => {
                const value = defaultAttributes[key];
                if (!this.hasAttribute(key)) {
                    this.setAttribute(key,
                        typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)
                    );
                }
            });

            if (lifecycle.construct) {
                lifecycle.construct.call(this);
            }
        }

        connectedCallback() {
            if (lifecycle.connect) {
                lifecycle.connect({ element: this });
            }

            if (lifecycle.render) {
                this.processRenderResult(lifecycle.render({ element: this }));
            }
        }

        disconnectedCallback() {
            if (this._unsubscribeState) {
                this._unsubscribeState();
            }

            if (lifecycle.disconnect) {
                lifecycle.disconnect({ element: this });
            }

            if (this.disconnectHandler) {
                this.disconnectHandler();
            }
        }

        attributeChangedCallback(
            name: string,
            oldValue: string | null,
            newValue: string | null
        ) {
            if (lifecycle.attributeChanged) {
                lifecycle.attributeChanged({
                    name,
                    oldValue,
                    newValue,
                    element: this
                });
            }
        }

        adoptedCallback(oldDocument: Document, newDocument: Document) {
            if (lifecycle.adoptedCallback) {
                lifecycle.adoptedCallback({
                    oldDocument,
                    newDocument
                });
            }
        }

        addDisconnectHandler(handler: () => void) {
            this.disconnectHandler = handler;
        }

        rerender() {
            if (lifecycle.render) {
                this.processRenderResult(lifecycle.render({ element: this }));
            }
        }

        private processRenderResult(result: RenderResult) {
            if (this._unsubscribeState) {
                this._unsubscribeState();
            }

            if (result instanceof Function) {
                this._unsubscribeState = result;
            } else {
                render(result, this);
            }
        }
    };

    customElements.define(tagName, Component);
    return Component;
};