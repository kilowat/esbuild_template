type WebComponentAttributes = {
    observedAttributes?: string[];
    defaultAttributes?: Record<string, any>;
};

type ComponentLifecycle = {
    construct?: () => void;
    connect?: (element: ExtendedHTMLElement) => void;
    disconnect?: (element: ExtendedHTMLElement) => void;
    render?: (element: ExtendedHTMLElement) => void;

    attributeChanged?: (
        name: string,
        oldValue: string | null,
        newValue: string | null,
        element: ExtendedHTMLElement
    ) => void;

    adoptedCallback?: (oldDocument: Document, newDocument: Document) => void;
};

// Расширяем интерфейс HTMLElement
interface ExtendedHTMLElement extends HTMLElement {
    addDisconnectHandler(handler: () => void): void;
    rerender?(): void;
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
                lifecycle.render(this);
            }
        }

        disconnectedCallback() {
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

        // Добавляем публичные методы с реализацией
        addDisconnectHandler(handler: () => void) {
            this.disconnectHandler = handler;
        }

        rerender() {
            if (lifecycle.render) {
                lifecycle.render(this);
            }
        }
    };

    customElements.define(tagName, Component);
    return Component;
};