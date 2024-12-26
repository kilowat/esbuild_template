import { html } from 'uhtml/reactive';
import { createComponent, createState } from '../uhtml';

// Директива для порталов в HTML
const portalDirective = (targetSelector: string) => (node: HTMLElement) => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    // Создаем плейсхолдер для сохранения позиции в оригинальном DOM
    const placeholder = document.createComment(`portal-placeholder: ${targetSelector}`);
    node.parentNode?.replaceChild(placeholder, node);

    // Перемещаем контент в целевой элемент
    target.appendChild(node);

    // Возвращаем функцию очистки
    return () => {
        node.remove();
        placeholder.replaceWith(node);
    };
};

// Создаем компонент с поддержкой порталов
createComponent({
    tagName: 'html-portal',
    state: createState({ target: '' }),
    observedAttributes: ['target'],
    attributeChanged({ name, newValue, state }) {
        if (name === 'target' && newValue) {
            state.emit({ target: newValue });
        }
    },
    render({ state, element, slots }) {
        if (!state.value.target) return html``;

        return html`
            <div portal=${portalDirective(state.value.target)}>
                ${slots.default}
            </div>
        `;
    }
});

// Пример компонента с модальным окном через портал
createComponent({
    tagName: 'modal-dialog',
    state: createState({ isOpen: false }),
    render({ state, element, slots }) {
        if (!state.value.isOpen) return html``;

        return html`
            <html-portal target="#modal-root">
                <div class="modal">
                    <div class="modal-content">
                        ${slots.default}
                        <button 
                            @click=${() => state.emit({ isOpen: false })}
                            class="modal-close"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </html-portal>
        `;
    }
});

// Пример компонента с уведомлениями через портал
createComponent({
    tagName: 'notification-toast',
    state: createState({
        message: '',
        type: 'info'
    }),
    connected({ state, element }) {
        // Автоматически скрываем уведомление через 3 секунды
        setTimeout(() => {
            element.remove();
        }, 3000);
    },
    render({ state }) {
        return html`
            <html-portal target="#notifications-root">
                <div class="toast ${state.value.type}">
                    ${state.value.message}
                </div>
            </html-portal>
        `;
    }
});