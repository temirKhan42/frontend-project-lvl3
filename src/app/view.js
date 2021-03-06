import * as yup from 'yup';
import makeRequest from './makeRequest.js';
import parsingRssToDom from './parsingRssToDom.js';
import buildRssContainerInState from './buildRssContainerInState.js';
import renderRssContainerInDom from './renderRssContainer.js';

yup.setLocale({
  string: {
    url: 'URL invalid',
    required: 'Empty URL',
  },
});

const schema = yup.object().shape({
  urlRequired: yup.string().required(),
  website: yup.string().url(),
});

const checkUrlDoubles = (url, { addedUrls }) => {
  if (addedUrls.includes(url)) {
    throw new Error('RSS exists');
  }
};

const checkValidation = (url, stateWatcher, elements, i18n) => (schema
  .validate({ urlRequired: url, website: url })
  .then(() => checkUrlDoubles(url, stateWatcher))
  .then(() => makeRequest(url))
  .then((response) => parsingRssToDom(response))
  .then((response) => buildRssContainerInState(response, stateWatcher))
  .then(() => renderRssContainerInDom(stateWatcher, elements, i18n))
);

const renderValidation = (stateWatcher, elements, i18n) => {
  const { input, button } = elements;
  const urlProcess = stateWatcher.addingUrlProcess;

  input.disabled = true;
  input.setAttribute('readonly', 'true');
  button.disabled = true;

  checkValidation(urlProcess.value, stateWatcher, elements, i18n)
    .then(() => { urlProcess.state = 'valid'; })
    .catch((err) => {
      console.log(err);
      if (err.message === 'Empty URL') {
        urlProcess.error = 'emptyUrl';
      } else if (err.message === 'URL invalid') {
        urlProcess.error = 'urlInvalid';
      } else if (err.message === 'RSS exists') {
        urlProcess.error = 'rssExists';
      } else if (err.message === 'RSS invalid') {
        urlProcess.error = 'rssInvalid';
      } else if (err.message === 'Network Error') {
        urlProcess.error = 'networkError';
      } else {
        urlProcess.error = 'loadingUrlError';
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
  input.removeAttribute('readonly');
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
  input.removeAttribute('readonly');
  button.disabled = false;
  input.classList.add('red-frame');
  messageElem.innerHTML = i18n.t(`form.message.error.${urlProcess.error}`);
  messageElem.classList.add('text-danger');
  messageElem.classList.remove('text-succes');
  urlProcess.value = '';
};

const render = (processState, stateWatcher, elements, i18n) => {
  if (processState === 'validation') {
    renderValidation(stateWatcher, elements, i18n);
  } else if (processState === 'valid') {
    renderValid(stateWatcher, elements, i18n);
  } else if (processState === 'novalid') {
    renderNovalid(stateWatcher, elements, i18n);
  } else {
    throw new Error(`Unknown state of process: ${processState}`);
  }
};

export default render;
