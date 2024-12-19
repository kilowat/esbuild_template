import { render } from "lit-html/lit-html";
import { globalContext } from "./context";
import { ComponentConfig, Provider, ProviderConfig } from "./types";

// Updated base element class with typed read method
export abstract class TypedHTMLElement extends HTMLElement {
    read<T>(provider: Provider<T>): T {
        return globalContext.read(this, provider);
    }

    setLocalProvider(): void {
        this.setAttribute('local-provider', '');
    }
}

// Updated component creation
export const createComponent = (tagName: string, config: ComponentConfig) => {
    const Component = class extends TypedHTMLElement {
        private unsubscribers: Array<() => void> = [];

        connectedCallback() {
            if (config.providers?.some(provider => provider)) {
                this.setLocalProvider();
            }

            if (config.providers) {
                config.providers.forEach(({ provider: type, create, lazy }) => {
                    if (!lazy) {
                        globalContext.provide(type, create);
                    }
                });
            }

            if (config.connect) {
                config.connect(this);
            }

            if (config.render) {
                const result = config.render(this);
                if (typeof result === 'function') {
                    this.unsubscribers.push(result as () => void);
                } else {
                    render(result, this);
                }
            }
        }

        disconnectedCallback() {
            this.unsubscribers.forEach(unsub => unsub());
            this.unsubscribers = [];
            globalContext.dispose(this);

            if (config.disconnect) {
                config.disconnect(this);
            }
        }
    };

    if (config.providers) {
        config.providers.forEach(({ provider: type, create, lazy }) => {
            if (lazy) {
                globalContext.provide(type, create);
            }
        });
    }

    if (!customElements.get(tagName)) {
        customElements.define(tagName, Component);
    }

    return Component;
};