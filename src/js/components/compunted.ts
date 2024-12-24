import { cmp, computed, html, signal } from "../uhtml";


export const counterSignal = signal(0);

// Определяем computed свойства
const computedProperties = {
    get d() {
        return computed(counterSignal, (value) => value * 2).value;
    },
    double: computed(counterSignal, (value) => value * 2),
    isEven: computed(counterSignal, (value) => value % 2 === 0),
};
const countD = computed(counterSignal, (value) => value * 2);

// Определяем actions
const actions = {
    increment: () => counterSignal.emit(counterSignal.value + 1),
    decrement: () => counterSignal.emit(counterSignal.value - 1),
};

// Создаем компонент
cmp({
    tagName: 'counter-component',
    signal: counterSignal,
    computed: computedProperties,
    actions: actions,
    render: ({ state, computed, actions }) => html`
    <div>
        <p>Counter: ${state}</p>
        <p>Doubleid: ${countD}</p>
        <p>Doubled: ${computedProperties.d}</p>
        <p>Is Even: ${computed.d}</p>
        <button @click=${actions.increment} id="increment">Increment</button>
        <button @click=${actions.decrement}>Decrement</button>
    </div>
    `,
});
