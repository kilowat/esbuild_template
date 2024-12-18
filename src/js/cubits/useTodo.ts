import { awaiter } from "../utils/awaiter";
import { useCubit } from "../utils/useCubit";


export interface TodoState {
    items: TodoItem[],
    status: 'ready' | 'success' | 'loading' | 'error',
}



export interface TodoItem {
    id: string,
    name: string,
}

export function useTodo() {
    const ctx = useCubit<TodoState>({
        items: [],
        status: 'ready',

    });

    const fetchItems = async () => {
        ctx.emit({ status: 'loading' });
        const items = await awaiter(1, [{ id: '1', name: 'test' }]);
        ctx.emit({ status: 'ready', items });
    }

    const addItem = async () => {
        ctx.emit({ status: 'loading' });
        await awaiter(1, []);
        const newItem = {
            id: (ctx.state.items.length + 1).toString(),
            name: 'test'
        };
        const items = [...ctx.state.items, newItem];
        ctx.emit({ status: 'success', items });
        ctx.emit({ status: 'ready' });
    }

    return {
        ctx,
        fetchItems,
        addItem,
        get isLoading() {
            return ctx.state.status === 'loading';
        },
    };
}
