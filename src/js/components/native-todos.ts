import { html, nothing, render } from "lit-html";
import useTodo, { TodoItem, TodoState } from "../cubit/useTodo";
import { listenCubit } from "../utils/useCubit";
import { createWebComponent } from "../utils/component";

export const todoStore = useTodo();

const buildView = (state: TodoState) => {
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

const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

const buildLoader = () => {
    return html`...loading`;
}

export default createWebComponent('native-todos', {
    connect(element) {
        const sub = listenCubit(todoStore.cubit, buildView)
        element.addDisconnectHandler(sub);
    },
});