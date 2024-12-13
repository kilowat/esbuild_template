import { useCubit } from "../utils/useCubit";

// Функция для работы с счетчиком
export const useCounterCubit = (initialCount: number) => {
    const cubit = useCubit(initialCount);

    return {
        subscribe: cubit.subscribe,
        inc: () => cubit.emit(cubit.state + 1),
        dec: () => cubit.emit(cubit.state - 1),
    };
};

const counterCubit = useCounterCubit(0);

export class MyCounterControlComponent extends HTMLElement {
    constructor() {
        super();
    }
    incrementButton: HTMLButtonElement | null = null;
    decrementButton: HTMLButtonElement | null = null;

    connectedCallback() {
        // Создаем начальную структуру DOM
        this.innerHTML = `
            <div>
                <button id="increment">Increment 0</button>
                <button id="decrement">Decrement 0</button>
            </div>
        `;

        // Кэшируем кнопки для обновления текста
        this.incrementButton = this.querySelector('#increment');
        this.decrementButton = this.querySelector('#decrement');

        // Добавляем обработчики событий
        this.incrementButton?.addEventListener('click', () => {
            counterCubit.inc();
        });

        this.decrementButton?.addEventListener('click', () => {
            counterCubit.dec();
        });

        // Подписка на изменения состояния
        counterCubit.subscribe((state) => {
            this.updateState(state);
            console.log(state);
        });
    }

    // Функция для обновления текста кнопок
    updateState(state: number) {

        // this.incrementButton?.firstChild.textContent = `Increment ${state}`;
        // this.decrementButton?.firstChild.textContent = `Decrement ${state}`;

    }

    disconnectedCallback() {
        // Здесь можно добавить логику отписки, если требуется
    }
}

// Регистрация веб-компонента
customElements.define('counter-control', MyCounterControlComponent);
