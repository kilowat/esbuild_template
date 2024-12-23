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
    status: 'init', items: []
})

export const todoInit = async () => {
    todoSignal.emit({ status: 'loading' })
    await awaiter(1);
    todoSignal.emit({ status: 'ready' })
}

export const todoAdd = () => { }

export const todoRemove = () => { }

export const todoUpdate = () => { }

export default cmp({
    signal: todoSignal,
    connected(params) {
        todoInit()
    },
    tagName: 'todo-list',
    listen(params) {

    },
    render: () => {
        return html`
        <div class="todos">
            <div>${todoSignal.value.status}</div>
            <div class="todo-list">
                ${todoSignal.value.items.map(TodoItem)}
            </div>
        <div>
    `
    }
})

const TodoItem = (item: ToDo) => {
    const html = htmlFor(TodoItem, item.id);
    return html`<div>${item.id}<div>`
}