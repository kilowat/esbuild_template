import { html } from "lit-html";
import { createWebComponent } from "../utils/component";
import { consumer } from "../utils/useCubit";
import { todoStore } from "./native-todos";


export default createWebComponent('shared-todos-count', {
    render(element) {
        return consumer({
            cubit: todoStore.cubit,
            element,
            build(state) {
                return html`<div class="todo-count">Count:${state.items.length}</div>`
            },
        })
    },
});