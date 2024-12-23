import './components';
import '../styles/index.scss';
import { render } from 'lit-html';
import { consumerInit } from './bloc/config';

// Инициализация render движка для consumer, можно использовать любой другой
consumerInit({
    renderer: {
        render: (result, container) => {
            render(result, container);
        },
        cleanup: (container) => {
            render('', container);
        }
    }
});