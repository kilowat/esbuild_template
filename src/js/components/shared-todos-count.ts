import { html } from "lit-html";
import { useComponent } from "../utils/useComponent";
import { Consumer } from "../utils/useCubit";
import { todoStore } from "./native-todos";


export default useComponent('shared-todos-count', {
    render(element) {
        return Consumer({
            cubit: todoStore.cubit,
            element,
            build({ state }) {
                return html`<div class="todo-count">Count:${state.items.length}</div>`
            },
        })
    },
});