import { html, } from "lit-html";
import { ComponentConsumer } from "../bloc/consumers";
import { useCubit } from "../bloc/useCubit";
import { awaiter } from "../utils/awaiter";

interface TodoItem {
    id: string,
    name: string
}

interface TodoState {
    status: 'init' | 'ready' | 'loading' | 'success' | 'error'
    items: TodoItem[]
}

export const cubit = useCubit<TodoState>({
    status: 'init',
    items: [],
})

export const initToDo = async () => {
    cubit.emit({ status: 'loading' });
    await awaiter(1);
    const items = [
        { id: '1', name: 'todo-1' },
        { id: '2', name: 'todo-2' },
    ];
    cubit.emit({ status: 'ready', items });
}

export const addTodo = async () => {
    cubit.emit({ status: 'loading' });
    await awaiter(1);
    const newItem = {
        id: cubit.state.items.length + 1,
        name: `todo ${cubit.state.items.length + 1}`
    }
    cubit.emit({ status: 'ready', items: [] });
}

export const editTodo = () => {

}

export const removeTodo = () => {

}

ComponentConsumer({
    cubit,
    tagName: 'todo-list',
    connected(params) {
        console.log('todo-connected')
        initToDo();
    },
    build({ state }) {
        return html`
            <div class="todo">
                <div class="todo-list">
                    ${state.items.map(buildItem)}
                 </div>
            </div>`
    },
})

function buildItem(item: TodoItem) {
    return html`
        <div class="todo-item">
        <div class="todo-prop">id: 1</div>
        <div class="todo-prop">name: name-1</div>
    </div>`
}
