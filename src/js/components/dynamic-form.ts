import Symbiote, { html, css } from '@symbiotejs/symbiote';
/*
interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'select';
    value?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    class?: string;
    validate?: (value: string) => string | null;  // Функция валидации для поля
}

interface FormData {
    [key: string]: string;
}

interface FormErrors {
    [key: string]: string | null;
}
interface DynamicFormState {
    formFields: FormField[];     // Массив полей формы с типизацией по T
    formData: FormData;                    // Данные формы типа T
    errors: FormErrors;           // Ошибки валидации, привязанные к полям формы
    formMessage: string;            // Сообщение формы (например, об ошибке или успешной отправке)

    // Метод для изменения значения в поле
    onInputChange: (e: Event) => void;

    // Метод для валидации формы
    validateForm: () => boolean;

    // Метод для обработки отправки формы
    submitForm: (e: Event) => void;
}


class DynamicForm extends Symbiote<DynamicFormState> {
    init$ = {
        formFields: [] as FormField[],
        formData: {} as FormData,
        errors: {} as FormErrors,
        formMessage: '',

        // Обработчик изменения полей
        onInputChange: (e: Event) => {
            const target = e.target as HTMLInputElement | HTMLSelectElement;
            const { name, value } = target;
            this.setFieldValue(name, value);
        },

        // Валидация формы перед отправкой
        validateForm: (): boolean => {
            const errors: FormErrors = {};
            this.$.formFields.forEach(field => {
                const value = this.$.formData[field.name] || '';
                let error = null;

                // Если есть функция валидации, выполняем её
                if (field.validate) {
                    error = field.validate(value);
                } else if (field.required && !value) {
                    error = `${field.label} is required.`;
                }

                errors[field.name] = error;
            });
            this.$.errors = errors;
            return Object.keys(errors).every(key => !errors[key]);
        },

        // Обработка отправки формы и генерация события
        submitForm: (e: Event) => {
            e.preventDefault();

            // Валидация данных
            if (!this.$.validateForm()) {
                this.$.formMessage = 'Please correct the errors before submitting.';
                return;
            }

            // Генерация пользовательского события с данными формы
            const formSubmitEvent = new CustomEvent('form-submit', {
                detail: this.$.formData,
                bubbles: true,
                composed: true
            });

            this.dispatchEvent(formSubmitEvent);
            this.$.formMessage = 'Form data submitted!';
        },
    }

    // Метод для установки значения поля извне
    setFieldValue(name: string, value: string) {
        this.$.formData[name] = value;
        // Автоматическая валидация при изменении значения поля
        const field = this.$.formFields.find(f => f.name === name);
        if (field?.validate) {
            this.$.errors[name] = field.validate(value);
        } else if (field?.required && !value) {
            this.$.errors[name] = `${field.label} is required.`;
        } else {
            this.$.errors[name] = null;
        }
    }

    // Метод для обновления ошибок валидации извне
    setValidationErrors(errors: FormErrors) {
        this.$.errors = { ...this.$.errors, ...errors };
    }

    // Переопределяем метод для принятия параметров полей формы
    connectedCallback() {
        super.connectedCallback();
        const fieldsFromAttr = this.getAttribute('fields');
        if (fieldsFromAttr) {
            try {
                this.$.formFields = JSON.parse(fieldsFromAttr);
            } catch (e) {
                console.error('Invalid JSON format for fields attribute:', e);
            }
        }
    }

    // Функция для рендеринга select
    static renderSelect(field: FormField) {
        return html`
      <select name="${field.name}" ${{ onchange: 'onInputChange' }}>
        ${field.options?.map(option => html`
          <option value="${option.value}">${option.label}</option>
        `)}
      </select>
    `;
    }

    // Определение шаблона
    static get template() {
        return html`
      <form class="form-grid" @submit="submitForm">
        ${this.$.formFields.map((field: FormField) => html`
          <div class="form-group ${field.class}">
            <label for="${field.name}">${field.label}</label>
            ${field.type === 'select'
                ? this.renderSelect(field)
                : html`
                <input 
                  type="${field.type}" 
                  name="${field.name}" 
                  value="${this.$.formData[field.name] || ''}" 
                  ${{ oninput: 'onInputChange' }} 
                />
              `}
            <span class="error">${this.$.errors[field.name] || ''}</span>
          </div>
        `)}
        <button type="submit">Submit</button>
        <div class="form-message">${this.$.formMessage}</div>
      </form>
    `;
    }

    // Определение стилей
    static get rootStyles() {
        return css`
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 1rem;
      }
      .form-group {
        display: flex;
        flex-direction: column;
      }
      .grid-item-1, .grid-item-2, .grid-item-4 {
        grid-column: span 1;
      }
      .grid-item-3 {
        grid-column: span 2;
      }
      .error {
        color: red;
        font-size: 0.8em;
      }
      .form-message {
        margin-top: 1em;
        font-size: 1.2em;
      }
    `;
    }
}

// Регистрация компонента
DynamicForm.reg('dynamic-form');

/*
const form = document.querySelector('dynamic-form');

// Пример установки значений полей
form.setFieldValue('username', 'JohnDoe');

// Пример установки ошибок валидации
form.setValidationErrors({
  username: 'Username is already taken'
});

// Пример задания функции валидации
const fields = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    required: true,
    validate: (value) => value.length < 3 ? 'Username must be at least 3 characters long' : null,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    validate: (value) => !/\S+@\S+\.\S+/.test(value) ? 'Invalid email address' : null,
  }
];

form.$.formFields = fields;
*/