import { counterCubit } from "./counter-example";



export class SharedCounter extends HTMLElement {
    constructor() {
        super();
    }


    block!: HTMLDivElement;

    unsubscribe!: () => void;

    connectedCallback() {
        // Подписка на изменения состояния
        this.unsubscribe = counterCubit.subscribe((state) => {
            this.updateState(state);
        }, (prevState, nextState) => prevState != nextState);
    }

    // Функция для обновления текста кнопок
    updateState(state: number) {
        // Создаем начальную структуру DOM
        this.innerHTML = `
            <div>
                ${state}
            </div>
        `;
    }

    disconnectedCallback() {
        // Здесь можно добавить логику отписки, если требуется
        this.unsubscribe();
    }
}

customElements.define('shared-counter', SharedCounter);
