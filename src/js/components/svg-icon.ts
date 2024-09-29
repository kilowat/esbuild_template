

export default class IconComponent extends HTMLElement {
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const iconName = this.getAttribute('name');
    if (iconName) {
      this.loadIcon(iconName);
    } else {
      console.error('Icon name not provided.');
      this.shadow.innerHTML = '<span>Icon not provided</span>';
    }
  }

  private async loadIcon(iconName: string) {
    try {
      const svgContent = await import(`../../icons/${iconName}.svg`);
      this.render(svgContent.default);
    } catch (err) {
      console.error(`Icon "${iconName}" not found.`, err);
      this.shadow.innerHTML = '<span>Icon not found</span>';
    }
  }

  private render(svg: string) {
    this.shadow.innerHTML = `
      <style>
        svg {
          width: var(--icon-size, 24px);
          height: var(--icon-size, 24px);
          fill: var(--icon-fill, currentColor);
        }
      </style>
      ${svg}
    `;
  }
}

customElements.define('svg-icon', IconComponent);
