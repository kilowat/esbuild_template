import { html } from "lit-html/lit-html";
import { createComponent } from "../utils/component";
import { ToDoCubit } from "../cubit/todo";
import { Consumer } from "../utils/cubit";
import { createProvider } from "../utils/context";
const TodoCubitProvider = createProvider<ToDoCubit>();

const AppRoot = createComponent('app-root', {
    providers: [
        {
            provider: TodoCubitProvider,
            create: () => new ToDoCubit(),
            lazy: false
        }
    ]
});

const TodoList = createComponent('todo-list', {
    connect: (element) => {


    },
    render: (element) => {
        const cubit = element.read(TodoCubitProvider);
        cubit.fetchItems();
        return Consumer({
            cubit,
            element,
            listener: () => {
                console.log('test')
            },
            build: ({ state }) => html`
            <div>
                <h2>Todo List</h2>
                ${state.status == 'loading'
                    ? html`<div>Loading...</div>`
                    : html`
                        <ul>
                            ${state.items.map(item => html`
                                <li>${item.id}</li>
                            `)}
                        </ul>
                    `}
            </div>
            <button @click=${() => cubit.addItem('test')}>click</button>
        `
        })
    }
});

const TodoForm = createComponent('todo-form', {
    render: (element) => {
        const cubit = element.read(TodoCubitProvider);
        const handleSubmit = (e: Event) => {
            const cubit = element.read(TodoCubitProvider);
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.querySelector('input') as HTMLInputElement;
            cubit.addItem('test');
            form.reset();
        };

        return html`
            <form @submit=${handleSubmit}>
                <input type="text" placeholder="New todo">
                <button type="submit">Add</button>
            </form>
        `;
    }
});