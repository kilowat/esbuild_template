import { html, nothing } from "lit-html";
import { consumer, useCubit } from "../utils/useCubit";
import { createWebComponent } from "../utils/component";
import { awaiter } from "../utils/awaiter";

export interface TodoState {
    items: TodoItem[],
    status: 'ready' | 'success' | 'loading' | 'error'
}

export interface TodoItem {
    id: string,
    name: string,
}

const cubit = useCubit<TodoState>({
    items: [],
    status: 'ready',

});

const fetchItems = async () => {
    cubit.emit({ status: 'loading' });
    const items = await awaiter(1, [{ id: '1', name: 'test' }])
    cubit.emit({ status: 'ready', items });
}

const addItem = async () => {
    cubit.emit({ status: 'loading' });
    await awaiter(1, [])
    const newItem = { id: (cubit.state.items.length + 1).toString(), name: 'test' };
    const items = [...cubit.state.items, newItem];
    cubit.emit({ status: 'success', items });
    cubit.emit({ status: 'ready' });
}

const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

const buildLoader = () => {
    return html`...loading`;
}


const build = () => {
    const { status, items } = cubit.state;
    const isLoading = status == 'loading';

    return html`
        <div class="grid-view">
            <div><button  @click=${addItem} ?disabled=${isLoading}>add</button></div>
            <div class="grid">
                ${isLoading ? buildLoader() : nothing}
                ${items.map(buildItem)}
                <test-todo></test-doto>
                <test-todo2></test-doto2>
            </div>
        </div>`;
}

createWebComponent('test-todo2', {
    render(element) {
        return html`test`
    },
});


createWebComponent('test-todo', {
    render(element) {
        consumer({
            cubit,
            element,
            build(state) {
                return html`<b>${JSON.stringify(state)}</b>`
            },
            buildWhen: (prevState, nextState) => {
                return nextState.items.length < 10;
            }
        })
    },
});


createWebComponent('native-todos', {
    connect(element) {
        fetchItems();
    },

    render(element) {
        consumer({
            cubit,
            element,
            build,
            listener: (state) => {
                console.log('item was added ');
            },
            listenWhen: (prevState, nextState) => {
                return nextState.status == 'success';
            }
        });
    },
});