import Symbiote, { html, css } from '@symbiotejs/symbiote';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
// init Swiper:
const swiper = new Swiper('.swiper', {
  modules: [Navigation, Pagination],
});

interface SliderState {
  count: number
}

export class MainSlider extends Symbiote<SliderState> {

}

// Define template:
MainSlider.template = html`
  <h2>{{count}}</h2>
  <button ${{ onclick: 'increment' }}>Click me!</button>
`;

// Describe styles:
MainSlider.rootStyles = css`
  main-slider {
    color: #f00;
  }
`;

// Register the new HTML-tag in browser:
MainSlider.reg('main-slider');