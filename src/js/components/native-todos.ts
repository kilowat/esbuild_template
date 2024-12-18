import { html, nothing } from "lit-html";
//import { Consumer } from "../utils/useCubit";
import { createComponent } from "../utils/component";
import { TodoItem, useTodo } from "../cubit/useTodo";
import { ToDoCubit } from "../cubit/todo";
import { Consumer } from "../utils/cubit";

export const todoCubit = new ToDoCubit()

const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}
// example by build function can reuse in any place
const buildLoader = (isActive: boolean = false) => {
    const text = isActive ? '...loading' : 'ready';
    return html`${text}`
}

//Example loader by component
createComponent('todo-loader', {
    render({ element }) {
        return Consumer({
            cubit: todoCubit,
            element,
            build() {
                const text = todoCubit.isLoading ? '...loading' : 'ready';
                return html`${text}`
            },
        })
    },
})

export default createComponent('native-todos', {
    connect() {
        todoCubit.fetchItems();
    },
    render: ({ element }) => Consumer({
        cubit: todoCubit,
        element,
        build: ({ state }) => {
            return html`
                <div class="grid-view">
                    <div><button  @click=${() => todoCubit.addItem()} ?disabled=${todoCubit.isLoading}>add</button></div>
                    <div class="grid">
                        ${buildLoader(todoCubit.isLoading)}
                        ${state.items.map(buildItem)}
                    </div>
                </div>`;
        }
        ,
        listener: () => {
            console.log('item was added ');
        },
        listenWhen: ({ nextState }) => {
            return nextState.status == 'success';
        }
    }),
});
