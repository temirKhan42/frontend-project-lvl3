import './src/style.scss';
import 'bootstrap/js/dist/modal.js';
import i18n from 'i18next';
import app from './src/app/app.js';
import resources from './src/app/locales/locales.js';

// app();

export default i18n.init({
  lng: 'ru',
  debug: false,
  resources,
}).then(() => app(i18n));
