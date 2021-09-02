import i18n from 'i18next';
import onChange from 'on-change';
import resources from './locales/locales.js';
import render from './view.js';
import checkRenewalDataOfUrls from './checkRenewallData.js';
import onModalVisible from './renderModal.js';

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
    uiState: {
      modal: {
        visibility: 'invisible',
        id: null,
        postId: null,
      },
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
