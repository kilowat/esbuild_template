import { html, nothing } from "lit-html";
import { Consumer } from "../utils/useCubit";
import { useComponent } from "../utils/useComponent";
import { TodoItem, useTodo } from "../cubits/useTodo";

export const todoStore = useTodo();

const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}
// example by build function can reuse in any place
const buildLoader = (isActive: boolean = false) => {
    const text = isActive ? '...loading' : 'ready';
    return html`${text}`
}

//Example loader by component
useComponent('todo-loader', {
    render(element) {
        return Consumer({
            cubit: todoStore.cubit,
            element,
            build() {
                const text = todoStore.isLoading ? '...loading' : 'ready';
                return html`${text}`
            },
        })
    },
})

export default useComponent('native-todos', {
    connect(element) {
        todoStore.fetchItems();
    },
    render: (element) => Consumer({
        cubit: todoStore.cubit,
        element,
        build: ({ state }) => {
            return html`
                <div class="grid-view">
                    <div><button  @click=${todoStore.addItem} ?disabled=${todoStore.isLoading}>add</button></div>
                    <div class="grid">
                        <todo-loader></todo-loader>
                        ${buildLoader(todoStore.isLoading)}
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
