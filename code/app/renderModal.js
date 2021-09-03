const renderPost = (stateWatcher, elements, id, postId) => {
  const dataId = [id, postId].join('.');

  const [...postsElements] = elements.listPosts.children;
  postsElements.forEach((postElem) => {
    const linkElem = postElem.firstElementChild;
    if (linkElem.getAttribute('data-id') === dataId) {
      linkElem.classList.remove('fw-bold');
      linkElem.classList.add('fw-normal');
    }
  });
};

const renderModal = (postData, elements) => {
  const { modalTitle, modalDescription, modalLink } = elements;
  modalTitle.textContent = postData.title;
  modalDescription.textContent = postData.description;
  modalLink.href = postData.link;
};

const onModalVisible = (stateWatcher, elements) => {
  const { id, postId } = stateWatcher.uiState.modal;

  const [postData] = stateWatcher.main.posts
    .filter((post) => post.id === id && post.postId === postId);

  renderModal(postData, elements);

  const [postObj] = stateWatcher.uiState.posts
    .filter((post) => (post.id === id && post.postId === postId));
  postObj.visibility = 'fw-normal';

  renderPost(stateWatcher, elements, id, postId);
};

export default onModalVisible;
