import { html, render } from "lit-html";
import { useCubit } from "../utils/useCubit";
import { awaiter } from '../utils/awaiter';




const gridCubit = useCubit({
    isLoading: false as boolean,
    items: [] as string[],
});


const gridInit = async () => {
    gridCubit.emit({ ...gridCubit.state, isLoading: true });
    const items = await awaiter(1, ['1', '2', '3'])
    gridCubit.emit({ ...gridCubit.state, isLoading: false, items });
}

export class NativeGridView extends HTMLElement {

    unsubscribe!: () => void;

    template() {
        console.log('here');
        return html`
        <div class="grid">
            ${gridCubit.state.items.map((item) => html`<div class="grid-item">${item}</div>`
        )}
        </div>`;
    }

    connectedCallback() {
        gridCubit.subscribe((state) => {
            render(this.template(), this);
        })
        gridInit();
    }

    disconnectedCallback() {
        this.unsubscribe();
    }
}

customElements.define('native-grid-view', NativeGridView);
