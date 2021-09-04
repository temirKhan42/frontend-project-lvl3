const renderRssContainerInDom = (stateWatcher, elements, i18n) => {
  const { main } = stateWatcher;

  if (main.feeds.length === 0 || main.posts.length === 0) {
    elements.postsContainer.classList.add('invisible');
    elements.feedsContainer.classList.add('invisible');
    return;
  }

  elements.feedsContainer.classList.remove('invisible');
  elements.postsContainer.classList.remove('invisible');
  const listElemPosts = elements.listPosts;
  const listElemFeeds = elements.listFeeds;
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
    listElemFeeds.append(li);
  });

  main.posts.forEach((post) => {
    const dataId = `${post.id}.${post.postId}`;

    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0', 'd-flex', 'justify-content-between', 'align-items-start');

    const linkElem = document.createElement('a');
    linkElem.classList.add('fw-bold');
    linkElem.setAttribute('data-id', dataId);
    linkElem.href = post.link;
    linkElem.target = '_blank';
    linkElem.rel = 'noopener noreferrer';
    linkElem.textContent = post.title;

    const buttonElem = document.createElement('button');
    buttonElem.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonElem.type = 'button';
    buttonElem.setAttribute('data-id', dataId);
    buttonElem.setAttribute('data-bs-toggle', 'modal');
    buttonElem.setAttribute('data-bs-target', '#modal');
    buttonElem.textContent = i18n.t('postContainer.buttonNames');

    li.append(linkElem, buttonElem);
    listElemPosts.append(li);
  });
};

export default renderRssContainerInDom;
