import { counterCubit, increment } from "../cubits/useCounter";



export class MyCounterControlComponent extends HTMLElement {
    constructor() {
        super();
    }

    unsubscribe!: () => void;

    render = () => {
        this.innerHTML = `
            <div>
                <button>${counterCubit.state}</button>
            </div>
        `;
    }

    connectedCallback() {
        this.addEventListener('click', () => {
            increment();
        });

        this.unsubscribe = counterCubit.subscribe((state) => {
            this.render();
        }, (prevState, nextState) => prevState != nextState);
    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}

customElements.define('counter-control', MyCounterControlComponent);
