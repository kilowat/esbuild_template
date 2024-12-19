
// component.ts
import { render } from "lit-html/lit-html";
import { globalContext } from "./context";
import { ComponentConfig, Provider } from "./types";

export abstract class TypedHTMLElement extends HTMLElement {
    private readonly _unsubscribers: Array<() => void> = [];

    read<T>(provider: Provider<T>): T {
        return globalContext.read(this, provider);
    }


    protected addUnsubscriber(unsubscribe: () => void): void {
        this._unsubscribers.push(unsubscribe);
    }

    protected clearUnsubscribers(): void {
        this._unsubscribers.forEach(unsub => unsub());
        this._unsubscribers.length = 0;
    }
}

export const createComponent = (tagName: string, config: ComponentConfig) => {
    const Component = class extends TypedHTMLElement {
        connectedCallback() {
            // Сначала регистрируем провайдеры
            if (config.providers) {
                config.providers.forEach(({ provider, create, lazy }) => {
                    globalContext.provide(provider, create);
                });
            }

            // Подключаем компонент
            if (config.connect) {
                const unsubscribe = config.connect(this);
                if (typeof unsubscribe === 'function') {
                    this.addUnsubscriber(unsubscribe);
                }
            }

            // Рендерим
            if (config.render) {
                const result = config.render(this);
                if (typeof result === 'function') {
                    this.addUnsubscriber(result as () => void);
                } else {
                    render(result, this);
                }
            }
        }

        disconnectedCallback() {
            this.clearUnsubscribers();
            globalContext.dispose(this);

            if (config.disconnect) {
                config.disconnect(this);
            }
        }
    };

    // Регистрируем ленивые провайдеры на уровне определения компонента
    if (config.providers) {
        config.providers.forEach(({ provider, create, lazy }) => {
            if (lazy) {
                globalContext.provide(provider, create);
            }
        });
    }

    if (!customElements.get(tagName)) {
        customElements.define(tagName, Component);
    }

    return Component;
};