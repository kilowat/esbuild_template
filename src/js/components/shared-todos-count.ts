import { html } from "lit-html";
import { createComponent } from "../utils/component";

import { todoCubit } from "./native-todos";
import { Consumer } from "../utils/cubit";

export default createComponent('shared-todos-count', {
    render({ element }) {
        return Consumer({
            cubit: todoCubit,
            element,
            build({ state }) {
                return html`<div class="todo-count">Count:${state.items.length}</div>`
            },
        })
    },
});