import { createComponent, compute, createComputed, html, createState } from "../uhtml";


export const state = createState(0);

export const computed = createComputed({
    double: () => compute(state, value => value * 2),
    isEven: () => compute(state, value => value % 2 === 0),
    isOdd: () => compute(state, value => value % 2 !== 0)
});

export const actions = {
    increment: () => state.emit(state.peek() + 1),
    decrement: () => state.emit(state.value - 1),
};

createComponent({
    tagName: 'counter-component',
    state,
    computed,
    actions,
    render({ state, computed, actions, slots }) {
        return html`
        <div>
            <p>Counter: ${state}</p>
            <p>Double: ${computed.double}</p>
            <p>Is Even: ${computed.isEven}</p>
            <p>Is Odd: ${computed.isOdd}</p>
            ${slots.header || html`<p>Default Header</p>`}
            <button @click=${actions.increment} id="increment">Increment</button>
            <button @click=${actions.decrement}>Decrement</button>
        </div>`
    },
});