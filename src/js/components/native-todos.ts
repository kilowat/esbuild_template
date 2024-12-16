import { html, nothing, render } from "lit-html";
import todoCubit, { TodoItem } from "../cubits/useTodo";


const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

const buildLoader = () => {
    return html`...loading`;
}

export class NativeTodos extends HTMLElement {

    unsubscribe!: () => void;

    template() {
        console.log(todoCubit.state)
        const { isLoading, items } = todoCubit.state;
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
        todoCubit.subscribe(() => {
            render(this.template(), this);
        })
        todoCubit.fetchItems()
        todoCubit.fetchItems()
    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}

customElements.define('native-todos', NativeTodos);
