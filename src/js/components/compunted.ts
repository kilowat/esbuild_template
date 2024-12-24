import { cmp, compute, html, state } from "../uhtml";


export const counterState = state(0);

// Определяем computed свойства
const computedProps = {
    get double() {
        return compute(counterState, (value) => value * 2).value;
    },
    get isEvent() {
        return compute(counterState, (value) => value % 2 === 0).value;
    }
};

const isOdd = () => compute(counterState, (value) => value % 2 !== 0).value;

// Определяем actions
const actions = {
    increment: () => counterState.emit(counterState.value + 1),
    decrement: () => counterState.emit(counterState.value - 1),
};

// Создаем компонент
cmp({
    tagName: 'counter-component',
    state: counterState,
    computed: computedProps,
    actions: actions,
    render: ({ state, computed, actions }) => html`
    <div>
        <p>Counter: ${state}</p>
        <p>Double: ${computed.double}</p>
        <p>Is Even: ${computed.isEvent}</p>
        <p>Is odd: ${isOdd()}</p>
        <button @click=${actions.increment} id="increment">Increment</button>
        <button @click=${actions.decrement}>Decrement</button>
    </div>
    `,
});
