import { html, nothing, render } from "lit-html";
import { TodoItem, TodoState } from "../cubits/useTodo";
import useTodo from "../cubits/useTodo";



const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

const buildLoader = () => {
    return html`...loading`;
}

export class NativeTodos extends HTMLElement {

    unsubscribe!: () => void;

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
        const todoCubit = useTodo();
        todoCubit.subscribe((state) => {
            render(this.template(state), this);
            console.log(todoCubit.state.items)
        })
        todoCubit.fetchItems()
        todoCubit.fetchItems()
    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}

customElements.define('native-todos', NativeTodos);
