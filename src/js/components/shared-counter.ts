import { counterCubit } from "../cubits/useCounter";

export class SharedCounter extends HTMLElement {
    constructor() {
        super();
    }

    block!: HTMLDivElement;

    unsubscribe!: () => void;

    connectedCallback() {
        this.unsubscribe = counterCubit.subscribe((state) => {
            this.updateState(state);
        }, (prevState, nextState) => prevState != nextState);
    }

    updateState(state: number) {
        this.innerHTML = `
            <div>
                ${state}
            </div>
        `;
    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}

customElements.define('shared-counter', SharedCounter);
