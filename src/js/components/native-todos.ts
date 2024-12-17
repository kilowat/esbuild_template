import { html, nothing } from "lit-html";
import { listenCubit, renderCubit, useCubit } from "../utils/useCubit";
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

const build = (state: TodoState) => {
    const { status, items } = state;
    const isLoading = status == 'loading';

    return html`
        <div class="grid-view">
            <div><button  @click=${addItem} ?disabled=${isLoading}>add</button></div>
            <div class="grid">
                ${isLoading ? buildLoader() : nothing}
                ${items.map(buildItem)}
            </div>
        </div>`;
}

const buildItem = (item: TodoItem) => {
    return html`<div class="grid-item">${item.id}</div>`;
}

const buildLoader = () => {
    return html`...loading`;
}

export default createWebComponent('native-todos', {
    connect(element) {
        fetchItems();
        listenCubit({
            cubit,
            listener: (state) => {
                console.log('item was added ');
            },
            buildWhen: (prevState, nextState) => {
                return prevState.status !== 'ready' && nextState.status == 'success';
            }
        })
    },

    render(element) {
        renderCubit({ cubit, element, build });

    },
});