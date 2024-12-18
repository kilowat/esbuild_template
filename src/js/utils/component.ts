import { html, render } from "lit-html/lit-html";
import { Consumer } from "./cubit";

type WebComponentAttributes = {
    observedAttributes?: string[];
    defaultAttributes?: Record<string, any>;
};

type RenderResult = ReturnType<typeof html> | ReturnType<typeof Consumer>;

type ComponentLifecycle = {
    construct?: () => void;
    connect?: (element: ExtendedHTMLElement) => void;
    disconnect?: (element: ExtendedHTMLElement) => void;
    render?: (element: ExtendedHTMLElement) => RenderResult;
    attributeChanged?: (
        name: string,
        oldValue: string | null,
        newValue: string | null,
        element: ExtendedHTMLElement
    ) => void;
    adoptedCallback?: (oldDocument: Document, newDocument: Document) => void;
};

interface ExtendedHTMLElement extends HTMLElement {
    addDisconnectHandler(handler: () => void): void;
    rerender?(): void;
    _unsubscribeState?: () => void;
}

export const createWebComponent = (
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
                lifecycle.connect(this);
            }

            if (lifecycle.render) {
                this.processRenderResult(lifecycle.render(this));
            }
        }

        disconnectedCallback() {
            // Отписываемся от состояния перед удалением компонента
            if (this._unsubscribeState) {
                this._unsubscribeState();
            }

            if (lifecycle.disconnect) {
                lifecycle.disconnect(this);
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
                lifecycle.attributeChanged(name, oldValue, newValue, this);
            }
        }

        adoptedCallback(oldDocument: Document, newDocument: Document) {
            if (lifecycle.adoptedCallback) {
                lifecycle.adoptedCallback(oldDocument, newDocument);
            }
        }

        addDisconnectHandler(handler: () => void) {
            this.disconnectHandler = handler;
        }

        rerender() {
            if (lifecycle.render) {
                this.processRenderResult(lifecycle.render(this));
            }
        }

        private processRenderResult(result: RenderResult) {
            // Отписываемся от предыдущей подписки, если она была
            if (this._unsubscribeState) {
                this._unsubscribeState();
            }

            if (result instanceof Function) {
                // Если это результат consumer, сохраняем возвращаемую функцию отписки
                this._unsubscribeState = result;
            } else {
                // Если это html из lit-html, просто рендерим
                render(result, this);
            }
        }
    };

    customElements.define(tagName, Component);
    return Component;
};