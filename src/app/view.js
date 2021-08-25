import * as yup from 'yup';

const schema = yup.object().shape({
  website: yup.string().url(),
});

const checkValidation = (url, stateWatcher) => {
  const { addingUrlProcess, addedUrls } = stateWatcher;

  return schema
    .validate({ website: url })
    .catch(() => {
      addingUrlProcess.error = 'urlInvalid';
      throw new Error('url invalid');
    })
    .then(() => {
      fetch(url);
    })
    .catch((err) => {
      if (err.message === 'url invalid') {
        throw err;
      } else {
        addingUrlProcess.error = 'rssInvalid';
        throw new Error('rss invalid');
      }
    })
    .then(() => {
      if (addedUrls.includes(url)) {
        throw new Error('rss exists');
      }
      return true;
    })
    .catch((err) => {
      if (err.message === 'rss exists') {
        addingUrlProcess.error = 'rssExists';
      }
      throw err;
    });
};

const render = (processState, stateWatcher, elements, i18n) => {
  const {
    form, messageElem, input, button,
  } = elements;
  const urlProcess = stateWatcher.addingUrlProcess;

  if (processState === 'validation') {
    input.disabled = true;
    button.disabled = true;

    checkValidation(urlProcess.value, stateWatcher)
      .then(() => { urlProcess.state = 'valid'; })
      .catch((err) => {
        console.log(err.message);
        urlProcess.state = 'novalid';
      });
  } else if (processState === 'valid') {
    input.disabled = false;
    button.disabled = false;
    input.classList.remove('red-frame');
    form.reset();
    form.focus();
    stateWatcher.addedUrls.push(urlProcess.value);
    messageElem.innerHTML = i18n.t('form.message.succes');
    messageElem.classList.remove('error');
    messageElem.classList.add('succes');
    urlProcess.value = '';
  } else if (processState === 'novalid') {
    input.disabled = false;
    button.disabled = false;
    input.classList.add('red-frame');
    messageElem.innerHTML = i18n.t(`form.message.error.${urlProcess.error}`);
    messageElem.classList.add('error');
    messageElem.classList.remove('succes');
  }
};

export default (processState, stateWatcher, elements, i18n) => (
  new Promise((resolve) => {
    render(processState, stateWatcher, elements, i18n);
    resolve(true);
  })
);
