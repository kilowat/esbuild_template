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

export class CounterComponent extends Symbiote<any> {
    private cubit: CounterCubit;

    init$ = {
        state: '0',
        increment: () => {
            this.cubit.increment();
        },
        decrement: () => {
            this.cubit.decrement();
        },
    };

    constructor() {
        super();
        this.cubit = new CounterCubit();

        // Подписываемся на изменения состояния в Cubit
        this.cubit.subscribe((state) => {
            this.$.state = state;
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
      <h1>Counter: {{counter}}</h1>
      <button ${{ onclick: 'decrement' }}>Decrement</button>
      <button ${{ onclick: 'increment' }}>Increment</button>
    </div>
  `;
}

// Регистрируем компонент
CounterComponent.reg('counter-component');
