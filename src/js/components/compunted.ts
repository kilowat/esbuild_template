import { createComponent, compute, createComputed, html, createState } from "../uhtml";

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
    connected(context) {

    },
    render({ state, actions, computed, slots }) {
        return html`
        <div>
            <p>Counter: ${state.value}</p>
            <p>Double: ${computed.double.value}</p>
            <p>Is Even: ${computed.isEven.value}</p>
            <p>Is Odd: ${computed.isOdd.value}</p>
            ${slots.header || html`<p>Default Header</p>`}
            <button @click=${actions.increment} id="increment">Increment</button>
            <button @click=${actions.decrement}>Decrement</button>
        </div>`
    },
});
