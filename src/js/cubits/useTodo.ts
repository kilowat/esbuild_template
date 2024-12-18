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

export function useTodo() {
    const cubit = useCubit<TodoState>({
        items: [],
        status: 'ready',
    });

    const fetchItems = () => {
        cubit.emit({ status: 'loading' });
        awaiter(1, [{ id: '1', name: 'test' }]).then(items => {
            cubit.emit({ status: 'ready', items });
        });
    }

    const addItem = () => {
        cubit.emit({ status: 'loading' });
        awaiter(1, []).then(() => {
            const newItem = {
                id: (cubit.state.items.length + 1).toString(),
                name: 'test'
            };
            const items = [...cubit.state.items, newItem];
            cubit.emit({ status: 'success', items });
            cubit.emit({ status: 'ready' });
        });
    }

    const isLoading = () => cubit.state.status === 'loading';

    return {
        ...cubit,
        fetchItems,
        addItem,
        get isLoading() {
            return cubit.state.status === 'loading';
        },
    };
}
