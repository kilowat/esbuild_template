import { html, nothing } from "lit-html";
import { consumer } from "../utils/useCubit";
import { createWebComponent } from "../utils/component";
import useTodo, { TodoItem } from "../store/useTodo";

export const todoStore = useTodo();

const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

const buildLoader = () => {
    return html`...loading`;
}

export default createWebComponent('native-todos', {
    connect(element) {
        todoStore.fetchItems();
    },
    render: (element) => consumer({
        cubit: todoStore.cubit,
        element,
        build: (state) => {
            const { isLoading, addItem } = todoStore;

            return html`
                <div class="grid-view">
                    <div><button  @click=${addItem} ?disabled=${isLoading}>add</button></div>
                    <div class="grid">
                        ${isLoading ? buildLoader() : nothing}
                        ${state.items.map(buildItem)}
                    </div>
                </div>`;
        }
        ,
        listener: (state) => {
            console.log('item was added ');
        },
        listenWhen: (prevState, nextState) => {
            return nextState.status == 'success';
        }
    }),
});
