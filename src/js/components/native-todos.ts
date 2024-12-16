import { html, render } from "lit-html";
import useTodo, { TodoItem } from "../cubits/useTodo";


const todoCubit = useTodo();


const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

export class NativeTodos extends HTMLElement {

    unsubscribe!: () => void;

    template() {
        return html`
            <div class="grid-view">
                <div><button>add</button></div>
                <div class="grid">
               
                </div>
            </div>`;
    }

    connectedCallback() {
        todoCubit.subscribe(() => {
            render(this.template(), this);
        })
        todoCubit.fetchItems()
    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}

customElements.define('native-todos', NativeTodos);
