
import { useCubit } from "../utils/useCubit";


export const useCounterCubit = (count: number) => {
    const { emit, state, subscribe, } = useCubit(count);

    return {
        subscribe,
        inc: () => emit(state + 1),
        deinc: () => emit(state - 1),
    }
}

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
                </div>
            `;

            // Добавляем обработчик на кнопку
            this.querySelector('#increment')?.addEventListener('click', () => {

                counterCubit.inc()
            });
        };
        counterCubit.subscribe((state) => {
            render(state);
            console.log(state);
        });
    }

    // Отписываемся при удалении компонента
    disconnectedCallback() {

    }
}

customElements.define('counter-control', MyCounterControlComponent);
