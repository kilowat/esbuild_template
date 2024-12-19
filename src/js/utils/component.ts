import { render } from "lit-html/lit-html";
import { globalContext } from "./context";
import { ComponentConfig } from "./types";


// Обновленный TypedHTMLElement
export abstract class TypedHTMLElement extends HTMLElement {
    read<T>(type: Function): T {
        return globalContext.read(this, type);
    }

    // Утилитный метод для установки локального провайдера
    setLocalProvider(): void {
        this.setAttribute('local-provider', '');
    }
}

// Обновленный компонент
export const createComponent = (tagName: string, config: ComponentConfig) => {
    const Component = class extends TypedHTMLElement {
        private unsubscribers: Array<() => void> = [];

        connectedCallback() {
            // Если есть локальные провайдеры, помечаем элемент
            if (config.providers?.some(provider => provider)) {
                this.setLocalProvider();
            }

            // Регистрируем провайдеры
            if (config.providers) {
                config.providers.forEach(({ type, create, lazy }) => {
                    if (!lazy) {
                        globalContext.provide(type, create);
                    }
                });
            }

            // Хуки и рендеринг
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

    // Регистрируем ленивые провайдеры
    if (config.providers) {
        config.providers.forEach(({ type, create, lazy }) => {
            if (lazy) {
                globalContext.provide(type, create);
            }
        });
    }

    // Регистрируем компонент
    if (!customElements.get(tagName)) {
        customElements.define(tagName, Component);
    }

    return Component;
};