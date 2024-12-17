import { counterCubit } from "../store/useCounter";

export class SharedCounter extends HTMLElement {
    constructor() {
        super();
    }

    block!: HTMLDivElement;

    unsubscribe!: () => void;

    connectedCallback() {

    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}

customElements.define('shared-counter', SharedCounter);
