import { cmp, html, htmlFor, signal } from "../uhtml";
import { awaiter } from "../utils/awaiter";

interface ToDo {
    id: string,
    name: string,
}

interface TodoState {
    status: 'init' | 'loading' | 'ready' | 'error',
    items: ToDo[]
}

export const todoSignal = signal<TodoState>({
    status: 'init',
    items: []
})

export const todoInit = async () => {
    todoSignal.emit({ status: 'loading' });
    await awaiter(1);
    const { items } = todoSignal.value;
    const newItem = { id: `${items.length + 1}`, name: `item${items.length + 1}` };
    const newItems = [...items, newItem];
    todoSignal.emit({ status: 'ready', items: newItems, });
}

export const todoAdd = async () => {
    todoSignal.emit({ status: 'loading' });
    await awaiter(1);
    const { items } = todoSignal.value;
    const newItem = { id: `${items.length + 1}`, name: `item${items.length + 1}` };
    const newItems = [...items, newItem];
    todoSignal.emit({ status: 'ready', items: newItems, });
}

export const todoRemove = () => { }

export const todoUpdate = () => { }

export default cmp({
    tagName: 'todo-list',
    signal: todoSignal,
    connected() {
        todoInit()
    },
    listen(params) {
        console.log('was changhed:', params)
    },
    render: ({ items, status }) => {
        return html`
        <div class="todos">
            <div><button @click="${todoAdd}" ?disabled=${status == 'loading'}>add</button></div>
            <div>${status}</div>
            <div class="todo-list">
                ${items.map(TodoItem)}
            </div>
        <div>
    `
    }
})

const TodoItem = (item: ToDo) => {
    const html = htmlFor(TodoItem, item.id);
    return html`<div>${item.id}<div>`
}