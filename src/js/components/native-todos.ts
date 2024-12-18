import { html, nothing } from "lit-html";
import { consumer } from "../utils/useCubit";
import { createWebComponent } from "../utils/component";
import useTodo, { TodoItem } from "../store/useTodo";

export const todoCubit = useTodo();

const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

const buildLoader = () => {
    return html`...loading`;
}

export default createWebComponent('native-todos', {
    connect(element) {
        todoCubit.actions.fetchItems();
    },
    render: (element) => consumer({
        cubit: todoCubit,
        element,
        build: (state) => {
            const isLoading = todoCubit.state.status == 'loading';
            const { addItem } = todoCubit.actions;
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
