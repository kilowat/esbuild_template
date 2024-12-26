import { createComponent, compute, html, createState } from "../uhtml";
import { State } from "../uhtml/state";

// Вариант определения в не компонента 
export const state = createState(0);
const computed = {
    double: compute(state, value => value * 2),
    isEven: compute(state, value => value % 2 === 0),
    isOdd: compute(state, value => value % 2 !== 0),
};
const actions = {
    increment: () => state.emit(state.value + 1),
    decrement: () => state.emit(state.value - 1),
}

createComponent({
    tagName: 'counter-component',
    state,
    computed,
    actions,
    render({ state, actions, computed, slots }) {
        return html`
        <div>
            <p>Counter: ${state}</p>
            <p>Double: ${computed.double.value}</p>
            <p>Is Even: ${computed.isEven.value}</p>
            <p>Is Odd: ${computed.isOdd.value}</p>
            ${slots.header || html`<p>Default Header</p>`}
            <button @click=${actions.increment} id="increment">Increment</button>
            <button @click=${actions.decrement}>Decrement</button>
        </div>`
    },
});


//Вариант 2 локальное минимальное определение определение
createComponent({
    tagName: 'counter-component-2',
    state: createState(0),
    render({ state }) {
        return html`
        <div>
            <p>Counter: ${state.value}</p>
            <button @click=${() => state.emit(state.value + 1)} id="increment">Increment</button>
            <button @click=${() => state.emit(state.value - 1)}>Decrement</button>
        </div>`
    },
});

// Вариант 3 композитно
const useActions = (state: State<number>) => {
    const increment = () => state.emit(state.value + 1)
    const decrement = () => state.emit(state.value - 1)
    return { increment, decrement };
}

const useComputed = (state: State<number>) => {
    const isOdd = compute(state, (value) => value % 2 !== 0);
    return { isOdd }
}

createComponent({
    tagName: 'counter-component-3',
    state: createState(0),
    actions({ state }) {
        return useActions(state)
    },
    computed({ state }) {
        return useComputed(state)
    },
    render({ state, actions, computed }) {
        return html`
        <div>
            <p>Counter: ${state.value}</p>
            <p>IsOdd: ${computed.isOdd.value}</p>
            <button @click=${() => actions.increment()} id="increment">Increment</button>
            <button @click=${() => actions.decrement()}>Decrement</button>
        </div>`
    },
});