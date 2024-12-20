import { html, nothing } from 'lit-html';
import { ComponentConsumer } from '../bloc/consumers';




export default ComponentConsumer({
    tagName: 'svg-icon',
    observedAttributes: ['data-name', 'data-size', 'data-color'],
    build: ({ element }) => {
        const name = element.getAttribute('data-name') ?? '';
        const size = element.getAttribute('data-size');
        const color = element.getAttribute('data-color');
        const height = `--icon-size: ${size}px;`
        const width = `--icon-size:${size}px;`
        const fill = `--icon-fill:${color};`;

        return html`
            <svg style="${height} ${width} ${fill}">
             <use href="#${name}"></use>
            </svg>
        `;
    }
});