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

    const { state, emit } = cubit;

    const fetchItems = async () => {
        emit(state.copy({ isLoading: true }));
        const items = await awaiter(1, [{ id: '1', name: 'test' }])
        emit(state.copy({ isLoading: false, items, }));
    }

    const addItem = async () => {
        emit(state.copy({ isLoading: true }));
        const items = await awaiter(1, [])
        emit(state.copy({ isLoading: false, items, }));
    }

    return {
        ...cubit,
        fetchItems,
        addItem
    }
}
