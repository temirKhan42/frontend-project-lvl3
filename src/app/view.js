import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'URL invalid',
  },
});

const schema = yup.object().shape({
  website: yup.string().url(),
});

const checkValidation = (url, stateWatcher) => {
  const { addingUrlProcess: urlProcess, addedUrls } = stateWatcher;

  return schema
    .validate({ website: url })
    .catch((err) => {
      urlProcess.error = 'urlInvalid';
      throw err;
    })
    .then(() => {
      if (addedUrls.includes(url)) {
        urlProcess.error = 'rssExists';
        throw new Error('RSS exists');
      }
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
      .catch(() => { urlProcess.state = 'novalid'; });
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
