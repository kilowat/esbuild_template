import Symbiote, { html } from '@symbiotejs/symbiote';
import { Cubit } from '../utils';

type CounterState = {
    count: number,
}
// Пример использования
class CounterCubit extends Cubit<CounterState> {
    constructor() {
        super({ count: 0 }); // Начальное состояние
    }

    increment(): void {
        this.emit({ count: this.state.count + 1 });
    }

    decrement(): void {
        this.emit({ count: this.state.count - 1 });
    }
}

type CounterProps = {
    increment: () => void,
    decrement: () => void,
} & CounterState

export class CounterComponent extends Symbiote<CounterProps> {
    private cubit: CounterCubit;

    constructor() {
        super();
        this.cubit = new CounterCubit();
    }

    init$ = {
        count: 0,
        increment: () => {
            this.cubit.increment();
        },
        decrement: () => {
            this.cubit.decrement();
        },
    };

    renderCallback(): void {
        // Подписываемся на изменения состояния в Cubit
        this.cubit.subscribe((state) => {
            this.set$(state);
        });
    }

    // Очистка подписок при удалении компонента
    disconnectedCallback() {
        super.disconnectedCallback();
        this.cubit.dispose(); // Освобождаем ресурсы
    }
    // Определяем шаблон компонента
    static template = html`
    <div>
      <h1>Counter: {{count}}</h1>
      <button ${{ onclick: 'decrement' }}>Decrement</button>
      <button ${{ onclick: 'increment' }}>Increment</button>
    </div>
  `;
}

// Регистрируем компонент
CounterComponent.reg('counter-component');
