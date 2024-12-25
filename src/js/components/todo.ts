import { createComponent, html, htmlFor, createState } from "../uhtml";
import { awaiter } from "../utils/awaiter";

interface ToDo {
    id: string,
    name: string,
}

interface TodoState {
    status: 'init' | 'loading' | 'ready' | 'error',
    items: ToDo[]
}

export const todoState = createState<TodoState>({
    status: 'init',
    items: []
})

export const todoInit = async () => {
    todoState.emit({ status: 'loading' });
    await awaiter(1);
    const { items } = todoState.value;
    const newItem = { id: `${items.length + 1}`, name: `item${items.length + 1}` };
    const newItems = [...items, newItem];
    todoState.emit({ status: 'ready', items: newItems, });
}

export const todoAdd = async () => {
    todoState.emit({ status: 'loading' });
    await awaiter(1);
    const { items } = todoState.value;
    const newItem = { id: `${items.length + 1}`, name: `item${items.length + 1}` };
    const newItems = [...items, newItem];
    todoState.emit({ status: 'ready', items: newItems, });
}

export const todoRemove = () => { }

export const todoUpdate = () => { }

export default createComponent({
    tagName: 'todo-list',
    state: todoState,
    connected() {
        todoInit()
    },
    render: ({ state }) => {
        return html`
        <div class="todos">
            <div><button @click="${todoAdd}" ?disabled=${status == 'loading'}>add</button></div>
            <div class="todo-list">
                ${state.items.map(TodoItem)}
            </div>
        <div>
    `
    }
})

const TodoItem = (item: ToDo) => {
    const html = htmlFor(TodoItem, item.id);
    return html`<div>${item.id}<div>`
}