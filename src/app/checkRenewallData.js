import _ from 'lodash';
import makeRequest from './makeRequest.js';
import parsingRssToDom from './parsingRssToDom.js';
import buildRssContainerInState from './buildRssContainerInState.js';
import renderRssContainerInDom from './renderRssContainer.js';

const getNormolizePosts = (posts) => posts.map((post) => {
  const newPost = {};
  Object.entries(post)
    .forEach(([key, val]) => {
      if (key === 'id' || key === 'postId') {
        return;
      }
      newPost[key] = val;
    });
  return newPost;
});

const getPostsDifference = (stateWatcher, fakePosts, id) => {
  const realPosts = stateWatcher.main.posts;
  const normRealPosts = getNormolizePosts(realPosts);
  const normFakePosts = getNormolizePosts(fakePosts);
  const diffs = _.differenceWith(normFakePosts, normRealPosts, _.isEqual);

  if (diffs.length === 0) {
    throw new Error('No Renewal Data');
  }

  const lastPostId = realPosts
    .filter((post) => post.id === id)
    .reduce((acc, postObj) => (acc > postObj.postId ? acc : postObj.postId), 0);

  return diffs.map((post, index) => {
    const postId = lastPostId + 1 + index;
    const uiObj = {
      id,
      postId,
      visibility: 'fw-bold',
    };
    stateWatcher.uiState.posts.push(uiObj);
    return { ...post, id, postId };
  });
};

const getIdOfUrl = (realFeeds, [fakeFeed]) => {
  const [{ id }] = realFeeds.filter((feed) => {
    if (feed.title === fakeFeed.title
    && feed.description === fakeFeed.description
    && feed.link === fakeFeed.link) {
      return true;
    }
    return false;
  });
  return id;
};

const renderPosts = (stateWatcher, elements) => {
  const [...postsElems] = elements.listPosts.children;
  const uiPosts = stateWatcher.uiState.posts;

  const dataIdList = uiPosts
    .filter((uiPost) => uiPost.visibility === 'fw-normal')
    .map((uiPost) => `${uiPost.id}.${uiPost.postId}`);

  postsElems
    .map((postElem) => postElem.firstElementChild)
    .filter((linkElem) => dataIdList.includes(linkElem.getAttribute('data-id')))
    .forEach((linkElem) => {
      linkElem.classList.remove('fw-bold');
      linkElem.classList.add('fw-normal');
    });
};

const clearFakeState = ({ main, uiState }) => {
  const { feeds, posts } = main;
  const { posts: uiPosts } = uiState;
  feeds.length = 0;
  posts.length = 0;
  uiPosts.length = 0;
};

const checkRenewalDataOfUrls = (stateWatcher, elements) => {
  const fakeState = {
    main: {
      feeds: [],
      posts: [],
    },
    addedUrls: [],
    uiState: {
      posts: [],
    },
  };

  const currentUrls = stateWatcher.addedUrls;
  const realPosts = stateWatcher.main.posts;
  const realFeeds = stateWatcher.main.feeds;

  const promise = new Promise((resolve) => {
    const result = currentUrls.forEach((url) => makeRequest(url)
      .then((response) => parsingRssToDom(response))
      .then((response) => buildRssContainerInState(response, fakeState))
      .then(() => getIdOfUrl(realFeeds, fakeState.main.feeds))
      .then((id) => getPostsDifference(stateWatcher, fakeState.main.posts, id))
      .then((diffPosts) => diffPosts.forEach((post) => realPosts.push(post)))
      .then(() => renderRssContainerInDom(stateWatcher, elements))
      .then(() => renderPosts(stateWatcher, elements))
      .then(() => clearFakeState(fakeState))
      .catch(() => { }));

    resolve(result);
  });

  promise
    .then(() => setTimeout(() => checkRenewalDataOfUrls(stateWatcher, elements), 5000))
    .catch(() => {});
};

export default checkRenewalDataOfUrls;
