export default class IconComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const iconName = this.getAttribute('name');
    if (iconName) {
      this.loadIcon(iconName);
    } else {
      console.error('Icon name not provided.');
      this.innerHTML = '<span>Icon not provided</span>';
    }
  }

  private async loadIcon(iconName: string) {
    try {
      const svgContent = await import(`../../icons/${iconName}.svg`);
      this.render(svgContent.default);
    } catch (err) {
      console.error(`Icon "${iconName}" not found.`, err);
      this.innerHTML = '<span>Icon not found</span>';
    }
  }

  private render(svg: string) {
    this.innerHTML = `
      ${svg}
    `;
  }
}

customElements.define('svg-icon', IconComponent);
