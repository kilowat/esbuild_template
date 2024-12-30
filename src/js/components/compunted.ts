import { compute, html, createState, defineComponent } from "../uhtml";

defineComponent({
    tagName: 'my-counter',
    state: () => createState({ count: 0 }),

    computed: ({ state }) => ({
        doubleCount: compute(state, (s) => s.count * 2),
        isEven: compute(state, (s) => s.count % 2 === 0)
    }),

    actions: ({ state }) => ({
        increment: (amount: number) => {
            state.emit({ count: state.value.count + amount });
        },
        reset: () => {
            state.emit({ count: 0 });
        }
    }),
    listen(params) {
        console.log('componnent liste')
    },
    render: ({ state, computed, actions }) => html`
        <div>
            <p >Count: ${state.value.count}</p>
            <p>Double: ${computed.doubleCount.value}</p>
            <p>Is Even: ${computed.isEven.value}</p>
            <button onclick=${() => actions.increment(1)}>+1</button>
            <button onclick=${actions.reset}>Reset</button>
        </div>
    `,
});