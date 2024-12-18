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
    const cubit = useCubit<TodoState>({
        items: [],
        status: 'ready',

    });

    const fetchItems = async () => {
        cubit.emit({ status: 'loading' });
        const items = await awaiter(1, [{ id: '1', name: 'test' }]);
        cubit.emit({ status: 'ready', items });
    }

    const addItem = async () => {
        cubit.emit({ status: 'loading' });
        await awaiter(1, []);
        const newItem = {
            id: (cubit.state.items.length + 1).toString(),
            name: 'test'
        };
        const items = [...cubit.state.items, newItem];
        cubit.emit({ status: 'success', items });
        cubit.emit({ status: 'ready' });
    }

    return {
        cubit,
        fetchItems,
        addItem,
        get isLoading() {
            return cubit.state.status === 'loading';
        },
    };
}
