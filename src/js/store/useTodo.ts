import { awaiter } from "../utils/awaiter";
import { useCubit } from "../utils/useCubit";

export interface TodoState {
    isLoading: boolean,
    items: TodoItem[],
}

export interface TodoItem {
    id: string,
    name: string,
}


export default () => {
    const cubit = useCubit<TodoState>({
        isLoading: false,
        items: [],
    });


    const fetchItems = async () => {
        cubit.emit({ isLoading: true });
        const items = await awaiter(1, [{ id: '1', name: 'test' }])
        cubit.emit({ isLoading: false, items });
    }

    const addItem = async () => {
        cubit.emit({ isLoading: true });
        await awaiter(1, [])
        const newItem = { id: (cubit.state.items.length + 1).toString(), name: 'test' };
        const items = [...cubit.state.items, newItem];
        cubit.emit({ isLoading: false, items });
    }

    return {
        cubit,
        fetchItems,
        addItem,
    }
}

