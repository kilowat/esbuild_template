import { Cubit, useCubit } from "../utils/useCubit";

// Функция для работы с счетчиком
const useCounterCubit = (initialCount: number) => {
    const cubit = useCubit(initialCount);

    return {
        subscribe: cubit.subscribe,
        inc: () => cubit.emit(cubit.state + 1),
        dec: () => cubit.emit(cubit.state - 1),
        state: () => cubit.state,
    };
};

export const counterCubit = useCounterCubit(0);

export class MyCounterControlComponent extends HTMLElement {
    constructor() {
        super();
    }

    incrementButton!: HTMLButtonElement;
    decrementButton!: HTMLButtonElement;
    unsubscribe!: () => void;

    connectedCallback() {
        // Создаем начальную структуру DOM
        this.innerHTML = `
            <div>
                <button id="increment">${counterCubit.state}</button>
                <button id="decrement">${counterCubit.state}</button>
            </div>
        `;

        // Кэшируем кнопки для обновления текста
        this.incrementButton = this.querySelector('#increment')!;
        this.decrementButton = this.querySelector('#decrement')!;

        // Добавляем обработчики событий
        this.incrementButton.addEventListener('click', () => {
            counterCubit.inc();
        });

        this.decrementButton.addEventListener('click', () => {
            counterCubit.dec();
        });

        // Подписка на изменения состояния
        this.unsubscribe = counterCubit.subscribe((state) => {
            this.updateState(state);
        }, (prevState, nextState) => prevState != nextState);
    }

    // Функция для обновления текста кнопок
    updateState(state: number) {
        this.incrementButton.textContent = state.toString();
        this.decrementButton.textContent = state.toString();
    }

    disconnectedCallback() {
        // Здесь можно добавить логику отписки, если требуется
        this.unsubscribe();
    }
}

customElements.define('counter-control', MyCounterControlComponent);
