import { awaiter } from "../utils/awaiter";
import { useCubit } from "../utils/useCubit";

export interface TodoState {
    items: TodoItem[],
    status: 'ready' | 'success' | 'loading' | 'error'
}

export interface TodoItem {
    id: string,
    name: string,
}

export default () => {
    return useCubit<TodoState>({
        state: {
            items: [],
            status: 'ready',
        },
        actions: {
            fetchItems: async ({ emit }) => {
                emit({ status: 'loading' });
                const items = await awaiter(1, [{ id: '1', name: 'test' }])
                emit({ status: 'ready', items });
            },
            addItem: async ({ emit, state }) => {
                emit({ status: 'loading' });
                await awaiter(1, [])
                const newItem = { id: (state.items.length + 1).toString(), name: 'test' };
                const items = [...state.items, newItem];
                emit({ status: 'success', items });
                emit({ status: 'ready' });
            },
        },
        getters: {
            isLoading: ({ state }) => { state.status == 'loading' }
        }
    });
}
