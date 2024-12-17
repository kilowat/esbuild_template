
import { counterCubit, increment } from "../cubit/useCounter";
import { render, html } from 'lit-html';
import { listenCubit } from "../utils/useCubit";

export class MyCounterControlComponent extends HTMLElement {
    constructor() {
        super();
    }

    unsubscribe!: () => void;

    connectedCallback() {
        this.unsubscribe = listenCubit(counterCubit, (state) => {
            render(this.template(), this);
        })
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

