import { html } from "lit-html";
import { useComponent } from "../utils/useComponent";
import { Consumer } from "../utils/useCubit";
import { todoCubit } from "./native-todos";


export default useComponent('shared-todos-count', {
    render(element) {
        return Consumer({
            cubit: todoCubit.cubit,
            element,
            build({ state }) {
                return html`<div class="todo-count">Count:${state.items.length}</div>`
            },
        })
    },
});