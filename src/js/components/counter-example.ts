
import { counterCubit, increment } from "../cubits/useCounter";
import { render, html } from 'lit-html';

export class MyCounterControlComponent extends HTMLElement {
    constructor() {
        super();
    }

    unsubscribe!: () => void;

    connectedCallback() {
        this.unsubscribe = counterCubit.subscribe((state) => {
            render(this.template(), this);
        });
    }

    template() {
        return html`
            <div>
                <button @click=${() => increment()}>
                    ${counterCubit.state}
                </button>
            </div>
        `;
    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}

customElements.define('counter-control', MyCounterControlComponent);

