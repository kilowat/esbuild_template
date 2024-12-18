import { html, nothing } from "lit-html";
import { Consumer } from "../utils/useCubit";
import { createWebComponent } from "../utils/component";
import { TodoItem } from "../cubits/useTodo";
import { useTodo } from "../cubits/useTodo";

export const todoCubit = useTodo();

const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

const buildLoader = () => {
    return html`...loading`;
}

export default createWebComponent('native-todos', {
    connect(element) {
        todoCubit.fetchItems();
    },
    render: (element) => Consumer({
        cubit: todoCubit,
        element,
        build: (state) => {
            const { isLoading, addItem } = todoCubit;

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
