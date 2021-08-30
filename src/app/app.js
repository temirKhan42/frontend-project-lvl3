import i18n from 'i18next';
import resources from './locales/locales.js';
import view from './view.js';

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

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    view(value, state, elements, i18n);
  });
};

export default () => {
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => startApp());
};
