import { html } from "lit-html/lit-html";
import { createComponent } from "../bloc/component";
import { ToDoCubit } from "../cubit/todo";
import { Consumer, CreateCubitProvider } from "../bloc";

const todoCubitProvider = CreateCubitProvider(() => new ToDoCubit());

createComponent('app-root', {
    providers: [
        todoCubitProvider,
    ],
    connect(element) {
        const cubit = element.read(todoCubitProvider)
        return Consumer({
            element,
            cubit,
            build(state) {
                console.log('test22')
            },
            listener: () => {
                console.log('root')
            }
        })
    },
});

createComponent('todo-list', {
    providers: [

    ],
    render: (element) => {
        const cubit = element.read(todoCubitProvider);
        cubit.fetchItems();
        return Consumer({
            cubit,
            element,
            listener: () => {
                console.log('todo-list')
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

createComponent('todo-form', {
    render: (element) => {
        const handleSubmit = (e: Event) => {
            const cubit = element.read(todoCubitProvider);
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