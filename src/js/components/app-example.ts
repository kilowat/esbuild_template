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

    connectedCallback() {
        // Рендер-функция для кнопки
        const render = (state: number) => {
            this.innerHTML = `
                <div>
                    <button id="increment">Increment ${state}</button>
                    <button id="decrement">Decrement ${state}</button>
                </div>
            `;

            // Добавляем обработчики на кнопки
            this.querySelector('#increment')?.addEventListener('click', () => {
                counterCubit.inc();
            });

            this.querySelector('#decrement')?.addEventListener('click', () => {
                counterCubit.dec();
            });
        };

        // Подписка на изменения состояния
        counterCubit.subscribe((state) => {
            render(state);
            console.log(state);
        });
    }

    // Отписываемся при удалении компонента
    disconnectedCallback() {
        // Можно добавить логику отписки, если нужно
    }
}

// Регистрация веб-компонента
customElements.define('counter-control', MyCounterControlComponent);