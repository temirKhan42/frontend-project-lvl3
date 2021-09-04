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
    listFeeds: document.querySelector('.feeds > .card > .list-group'),
    listPosts: document.querySelector('.posts > .card > .list-group'),
    modal: document.getElementById('modal'),
    modalTitle: document.querySelector('#modal .modal-content .modal-title'),
    modalDescription: document.querySelector('#modal .modal-content .modal-body'),
    modalLink: document.querySelector('#modal .modal-footer .full-article'),
    modalBtnClose: document.querySelector('#modal .btn-close'),
  };

  const stateWatcher = onChange(state, (path, currentValue) => {
    if (path === 'addingUrlProcess.value' && currentValue === '') {
      return;
    }

    if (path === 'addingUrlProcess.value') {
      stateWatcher.addingUrlProcess.state = 'validation';
    } else if (path === 'addingUrlProcess.state') {
      render(currentValue, stateWatcher, elements, i18n);
    } else if (path === 'addedUrls') {
      if (currentValue.length === 1) {
        checkRenewalDataOfUrls(stateWatcher, elements);
      }
    } else if (path === 'uiState.modal.visibility' && currentValue === 'visible') {
      onModalVisible(stateWatcher, elements);
    }
  });

  console.log(elements.form);
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    stateWatcher.addingUrlProcess.value = value;
  });

  elements.listPosts.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.tagName !== 'BUTTON') return;
    const dataId = e.target.getAttribute('data-id');
    e.target.disabled = 'true';
    const [id, postId] = dataId.split('.').map((idPart) => parseInt(idPart, 10));

    stateWatcher.uiState.modal.id = id;
    stateWatcher.uiState.modal.postId = postId;
    stateWatcher.uiState.modal.visibility = 'visible';
  });

  elements.modal.addEventListener('hidden.bs.modal', (e) => {
    e.preventDefault();
    stateWatcher.uiState.modal.visibility = 'invisible';
  });
};

export default () => {
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => startApp());
};
