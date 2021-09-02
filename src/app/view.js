import * as yup from 'yup';
import makeRequest from './makeRequest.js';
import parsingRssToDom from './parsingRssToDom.js';
import buildRssContainerInState from './buildRssContainerInState.js';
import renderRssContainerInDom from './renderRssContainer.js';

yup.setLocale({
  string: {
    url: 'URL invalid',
  },
});

const schema = yup.object().shape({
  website: yup.string().url(),
});

const checkUrlDoubles = (url, { addedUrls }) => {
  if (addedUrls.includes(url)) {
    throw new Error('RSS exists');
  }
};

const checkValidation = (url, stateWatcher, elements) => (schema
  .validate({ website: url })
  .then(() => checkUrlDoubles(url, stateWatcher))
  .then(() => makeRequest(url))
  .then((response) => parsingRssToDom(response))
  .then((response) => buildRssContainerInState(response, stateWatcher))
  .then(() => renderRssContainerInDom(stateWatcher, elements))
);

const renderValidation = (stateWatcher, elements) => {
  const { input, button } = elements;
  const urlProcess = stateWatcher.addingUrlProcess;

  input.disabled = true;
  button.disabled = true;

  checkValidation(urlProcess.value, stateWatcher, elements)
    .then(() => { urlProcess.state = 'valid'; })
    .catch((err) => {
      console.log(err);
      if (err.message === 'URL invalid') {
        urlProcess.error = 'urlInvalid';
      } else if (err.message === 'RSS exists') {
        urlProcess.error = 'rssExists';
      } else if (err.message === 'RSS invalid') {
        urlProcess.error = 'rssInvalid';
      } else if (err.message === 'Network Error') {
        urlProcess.error = 'networkError';
      }
      urlProcess.state = 'novalid';
    });
};

const renderValid = (stateWatcher, elements, i18n) => {
  const {
    button, input, form, messageElem,
  } = elements;
  const urlProcess = stateWatcher.addingUrlProcess;

  input.disabled = false;
  button.disabled = false;
  input.classList.remove('red-frame');
  form.reset();
  form.focus();
  messageElem.innerHTML = i18n.t('form.message.succes');
  messageElem.classList.remove('text-danger');
  messageElem.classList.add('text-succes');
  stateWatcher.addedUrls.push(urlProcess.value);
  urlProcess.value = '';
};

const renderNovalid = (stateWatcher, elements, i18n) => {
  const { input, button, messageElem } = elements;
  const urlProcess = stateWatcher.addingUrlProcess;

  input.disabled = false;
  button.disabled = false;
  input.classList.add('red-frame');
  messageElem.innerHTML = i18n.t(`form.message.error.${urlProcess.error}`);
  messageElem.classList.add('text-danger');
  messageElem.classList.remove('text-succes');
  urlProcess.value = '';
};

const render = (processState, stateWatcher, elements, i18n) => {
  if (processState === 'validation') {
    renderValidation(stateWatcher, elements);
  } else if (processState === 'valid') {
    renderValid(stateWatcher, elements, i18n);
  } else if (processState === 'novalid') {
    renderNovalid(stateWatcher, elements, i18n);
  }
};

export default render;
