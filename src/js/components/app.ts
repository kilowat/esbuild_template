


import { html, } from "lit-html/lit-html";
import { ComponentConsumer, QueryConsumer } from "../bloc/consumers";
import { useCubit } from "../bloc/useCubit";



export const cubit = useCubit(0)

ComponentConsumer({
    tagName: 'test-app',
    cubit,
    connected: () => console.log('connected test-app'),
    build: ({ state }) => html`
        <div>${state}</div>
        <button @click="${() => cubit.emit(state + 1)}">add</button>
    `
})

QueryConsumer({
    cubit,
    query: () => document.getElementById('test'),
    connected: () => console.log('connected query-test'),
    build({ state }) {
        return html`
        <div>${state}</div>
        <button @click="${() => cubit.emit(state + 1)}">add</button>
        `
    },
})