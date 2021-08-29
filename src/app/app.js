import i18n from 'i18next';
import onChange from 'on-change';
import resources from './locales/locales.js';
import render from './view.js';

const startApp = () => {
  const state = {
    addingUrlProcess: {
      value: '',
      error: '',
      state: '', // validation, valid, novalid
    },
    addedUrls: [],
    main: {
      feeds: [],
      posts: [],
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    button: document.querySelector('.btn.btn-lg'),
    messageElem: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.container-xxl .row .posts .card'),
    feedsContainer: document.querySelector('.container-xxl .row .feeds .card'),
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
  });
};

export default () => {
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => startApp());
};
