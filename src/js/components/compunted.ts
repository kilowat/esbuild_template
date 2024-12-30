import { compute, html, createState, defineComponent } from "../uhtml";
import { ComputedResult, State } from "../uhtml/state";

// Вариант определения в не компонента 
export const state = createState(0);

//Вариант 2 локальное минимальное определение определение
defineComponent({
    tagName: 'counter-component-2',
    state() {
        return state;
    },
    connected(context) {

    },
    render({ state, slots }) {
        return html`
        <div class="header">
        ${slots.header}
        </div>
        <div class="content">
            ${slots.default}
        </div>
        <div class="footer">
            ${slots.footer}
        </div>
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

defineComponent({
    tagName: 'counter-component-3',
    state() {
        return state;
    },
    computed: ({ state }) => {
        return useComputed(state)
    },
    actions({ state }) {
        return useActions(state)
    },
    listen(params) {
        console.log(params)
    },
    render({ state, actions, computed, slots }) {

        return html`
        <div>
            <div class="header">
                ${slots.header}
            </div>
            <div class="content">
                ${slots.default}
            </div>
            <div class="footer">
                ${slots.footer}
            </div>
            <p>Counter: ${state.value}</p>
            <p>IsOdd: ${computed.isOdd.value}</p>
            <button @click=${() => actions.increment()} id="increment">Increment</button>
            <button @click=${() => actions.decrement()}>Decrement</button>
        </div>`
    },
});

defineComponent({
    tagName: 'my-counter',
    state: () => createState({ count: 0 }),

    computed: ({ state }) => ({
        doubleCount: compute(state, (s) => s.count * 2),
        isEven: compute(state, (s) => s.count % 2 === 0)
    }),

    actions: ({ state, computed }) => ({
        increment: (amount: number) => {
            state.emit({ count: state.value.count + amount });
        },
        reset: () => {
            state.emit({ count: 0 });
        }
    }),
    connected(context) {

    },

    // Можно определять в любом порядке
    render: ({ state, computed, actions }) => html`
        <div>
            <p>Count: ${state.value.count}</p>
            <p>Double: ${computed.doubleCount.value}</p>
            <p>Is Even: ${computed.isEven.value}</p>
            <button onclick=${() => actions.increment(1)}>+1</button>
            <button onclick=${actions.reset}>Reset</button>
        </div>
    `,
});