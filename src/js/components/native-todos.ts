import { html, nothing, render } from "lit-html";
import useTodo, { TodoItem, TodoState } from "../store/useTodo";

import { listenCubit } from "../utils/useCubit";

export const todoStore = useTodo();

const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

const buildLoader = () => {
    return html`...loading`;
}

export class NativeTodos extends HTMLElement {
    unsub!: () => void;

    template(state: TodoState) {
        const { isLoading, items } = state;
        return html`
            <div class="grid-view">
                <div><button>add</button></div>
                <div class="grid">
                    ${isLoading ? buildLoader() : nothing}
                    ${items.map(buildItem)}
                </div>
            </div>`;
    }

    connectedCallback() {
        this.unsub = listenCubit(todoStore.cubit, (state) => {
            render(this.template(state), this);
        });

        todoStore.fetchItems();
    }

    disconnectedCallback() {
        this.unsub();
    }
}

customElements.define('native-todos', NativeTodos);