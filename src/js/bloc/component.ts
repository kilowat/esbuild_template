
// component.ts
import { render } from "lit-html/lit-html";

export type ComponentConfig = {
    connect?: (element: BlocHTMLElement) => void | (() => void);
    disconnect?: (element: BlocHTMLElement) => void;
    render?: (element: BlocHTMLElement) => unknown | (() => void);
};

abstract class BlocHTMLElement extends HTMLElement {
    private readonly _unsubscribers: Array<() => void> = [];

    protected addUnsubscriber(unsubscribe: () => void): void {
        this._unsubscribers.push(unsubscribe);
    }

    protected clearUnsubscribers(): void {
        this._unsubscribers.forEach(unsub => unsub());
        this._unsubscribers.length = 0;
    }
}

export const createComponent = (tagName: string, config: ComponentConfig) => {
    const Component = class extends BlocHTMLElement {
        connectedCallback() {

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

            if (config.disconnect) {
                config.disconnect(this);
            }
        }
    };

    if (!customElements.get(tagName)) {
        customElements.define(tagName, Component);
    }

    return Component;
};