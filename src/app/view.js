import * as yup from 'yup';
import axios from 'axios';

yup.setLocale({
  string: {
    url: 'URL invalid',
  },
});

const schema = yup.object().shape({
  website: yup.string().url(),
});

const renderRssContainerInDom = ({ main }, elements) => {
  if (main.feeds.length === 0 || main.posts.length === 0) {
    elements.postsContainer.classList.add('invisible');
    elements.feedsContainer.classList.add('invisible');
    return;
  }

  elements.feedsContainer.classList.remove('invisible');
  elements.postsContainer.classList.remove('invisible');
  const listElemPosts = elements.postsContainer.querySelector('.list-group');
  const listElemFeeds = elements.feedsContainer.querySelector('.list-group');
  listElemPosts.innerHTML = '';
  listElemFeeds.innerHTML = '';

  main.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const titleElem = document.createElement('h3');
    titleElem.classList.add('h6', 'm-o');
    titleElem.textContent = feed.title;

    const descriptionElem = document.createElement('p');
    descriptionElem.classList.add('m-o', 'small', 'text-black-50');
    descriptionElem.textContent = feed.description;

    li.append(titleElem, descriptionElem);
    listElemFeeds.prepend(li);
  });

  main.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0', 'd-flex', 'justify-content-between', 'align-items-start');

    const linkElem = document.createElement('a');
    linkElem.classList.add('fw-bold');
    linkElem.setAttribute('data-id', post.postId);
    linkElem.href = post.link;
    linkElem.target = '_blank';
    linkElem.rel = 'noopener noreferrer';
    linkElem.textContent = post.title;

    const buttonElem = document.createElement('button');
    buttonElem.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonElem.type = 'button';
    buttonElem.setAttribute('data-id', post.postId);
    buttonElem.setAttribute('data-bs-toggle', 'modal');
    buttonElem.setAttribute('data-bs-target', '#modal');
    buttonElem.textContent = 'Просмотр';

    li.append(linkElem, buttonElem);
    listElemPosts.prepend(li);
  });
};

const getCorrectedObject = (obj) => {
  const newObj = {};
  const objectArray = Object.entries(obj);
  objectArray.forEach(([key, value]) => {
    if (value.toString().startsWith('<![CDATA[')) {
      const newValue = value.split('').slice(9, -3).join('');
      newObj[key] = newValue;
      return;
    }
    newObj[key] = value;
  });

  return newObj;
};

let id = 0;

const buildRssContainerInState = (dataDom, { main }) => {
  const channel = dataDom.documentElement.querySelector('channel');
  const { feeds, posts } = main;

  id += 1;
  const iter = (elem, postId = 0) => {
    const obj = { id };

    [...elem.children].forEach((child) => {
      if (child.tagName === 'title') {
        obj.title = child.innerHTML;
      } else if (child.tagName === 'description') {
        obj.description = child.innerHTML;
      } else if (child.tagName === 'link') {
        obj.link = child.innerHTML;
      }
    });

    const correctedObj = getCorrectedObject(obj);

    if (elem.tagName === 'item') {
      correctedObj.postId = postId;
      posts.push(correctedObj);
      return;
    }

    feeds.push(correctedObj);
    let itemId = 0;
    [...elem.children].forEach((child) => {
      if (child.tagName === 'item') {
        iter(child, itemId += 1);
      }
    });
  };

  iter(channel);
};

const parsingRssToDom = (dataRss) => {
  const parser = new DOMParser();
  const dataDom = parser.parseFromString(dataRss, 'application/xml');
  if (dataDom.documentElement.tagName !== 'rss') {
    throw new Error('RSS invalid');
  }

  console.log(dataDom);
  return dataDom;
};

const makeRequest = (url) => (axios
  .get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => {
    if (response.status !== 200) {
      throw new Error('Something goes wrong');
    }
    return response.data.contents;
  })
  .catch((reject) => {
    throw reject;
  })
);

const checkValidation = (url, stateWatcher, elements) => (schema
  .validate({ website: url })
  .catch((err) => {
    throw err;
  })
  .then(() => {
    if (stateWatcher.addedUrls.includes(url)) {
      throw new Error('RSS exists');
    }
  })
  .then(() => makeRequest(url))
  .then((response) => parsingRssToDom(response))
  .then((response) => buildRssContainerInState(response, stateWatcher))
  .then(() => renderRssContainerInDom(stateWatcher, elements))
);

const render = (processState, stateWatcher, elements, i18n) => {
  const {
    form, messageElem, input, button,
  } = elements;
  const urlProcess = stateWatcher.addingUrlProcess;

  if (processState === 'validation') {
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
  } else if (processState === 'valid') {
    input.disabled = false;
    button.disabled = false;
    input.classList.remove('red-frame');
    form.reset();
    form.focus();
    stateWatcher.addedUrls.push(urlProcess.value);
    messageElem.innerHTML = i18n.t('form.message.succes');
    messageElem.classList.remove('text-danger');
    messageElem.classList.add('text-succes');
    urlProcess.value = '';
  } else if (processState === 'novalid') {
    input.disabled = false;
    button.disabled = false;
    input.classList.add('red-frame');
    messageElem.innerHTML = i18n.t(`form.message.error.${urlProcess.error}`);
    messageElem.classList.add('text-danger');
    messageElem.classList.remove('text-succes');
    urlProcess.value = '';
  }
};

export default render;
