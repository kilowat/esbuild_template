export class SvgIcon extends HTMLElement {
  svgContent: string;

  constructor(svgContent: string) {
    super();
    this.svgContent = svgContent;
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['fill']; // Наблюдаем за изменением атрибута fill
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const fillColor = this.getAttribute('fill') || 'currentColor';
    this.shadowRoot!.innerHTML = `
      <style>
      svg {
          width: var(--icon-size);
          height: var(--icon-size);
        }
        path {
          fill: ${fillColor};
        }
      </style>
      ${this.svgContent}
    `;
  }
}

// Функция для регистрации веб-компонента с определенным именем и SVG
export function defineSvgIcon(tagName: string, svgContent: string) {
  customElements.define(tagName, class extends SvgIcon {
    constructor() {
      super(svgContent);
    }
  });
}
