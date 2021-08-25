import i18n from 'i18next';
import onChange from 'on-change';
import resources from './locales/locales.js';
import render from './view.js';

export default () => {
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const state = {
    addingUrlProcess: {
      value: '',
      error: '',
      state: '', // validation, valid, novalid
    },
    addedUrls: [],
  };

  const elements = {
    form: document.querySelector('.form-rss'),
    input: document.getElementById('url-input'),
    button: document.getElementById('url-button'),
    messageElem: document.querySelector('.message'),
  };

  const stateWatcher = onChange(state, (path, currentValue) => {
    if (currentValue === '') {
      return;
    }

    if (path === 'addingUrlProcess.value') {
      stateWatcher.addingUrlProcess.state = 'validation';
    } else if (path === 'addingUrlProcess.state') {
      render(currentValue, stateWatcher, elements, i18n);
    }
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    stateWatcher.addingUrlProcess.value = value;
    console.log(stateWatcher.addedUrls);
  });
};
