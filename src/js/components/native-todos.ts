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
        setTimeout(() => { console.log(todoCubit); }, 5000)
        // Сохраняем возвращаемую функцию отписки
        this.unsubscribe = todoCubit.subscribe((state) => {
            render(this.template(state), this);
            console.log(todoCubit);
        });

        // Вызываем fetchItems() один раз
        todoCubit.fetchItems();
    }

    disconnectedCallback() {
        // Вызываем сохраненную функцию отписки
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

customElements.define('native-todos', NativeTodos);