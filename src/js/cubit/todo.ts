import { awaiter } from "../utils/awaiter";
import { Cubit } from "../bloc";

export interface TodoState {
    items: TodoItem[],
    status: 'ready' | 'success' | 'loading' | 'error'
}

export interface TodoItem {
    id: string,
    name: string,
}

export class ToDoCubit extends Cubit<TodoState> {
    constructor() {
        console.log('create')
        super({
            items: [],
            status: 'ready',
        });
    }
    async fetchItems() {
        this.emit({ status: 'loading' });
        const items = await awaiter(1, [{ id: '1', name: 'test' }])
        this.emit({ status: 'ready', items });
    }

    async addItem(value: string) {
        this.emit({ status: 'loading' });
        await awaiter(1, [])
        const newItem = { id: (this.state.items.length + 1).toString(), name: 'test' };
        const items = [...this.state.items, newItem];
        this.emit({ status: 'success', items });
        this.emit({ status: 'ready' });
    }
    get isLoading() {
        return this.state.status == 'loading';
    }
}


