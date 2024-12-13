import { counterCubit, increment } from "../cubits/useCounter";
import { render, html } from 'lit-html';

export class MyCounterControlComponent extends HTMLElement {
    constructor() {
        super();
    }

    unsubscribe!: () => void;

    template() {
        return html`
            <div>
                <button @click=${() => increment()}>
                    ${counterCubit.state}
                </button>
            </div>
        `;
    }

    connectedCallback() {
        this.addEventListener('click', () => {
            increment();
        });

        this.unsubscribe = counterCubit.subscribe((state) => {
            render(this.template(), this);
        }, (prevState, nextState) => prevState != nextState);
    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}

customElements.define('counter-control', MyCounterControlComponent);

