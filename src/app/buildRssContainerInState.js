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

const buildRssContainerInState = (dataDom, stateWatcher) => {
  const channel = dataDom.documentElement.querySelector('channel');
  const uiPosts = stateWatcher.uiState.posts;

  const currentFeeds = [];
  const currentPosts = [];
  const id = stateWatcher.addedUrls.length + 1;

  const iter = (elem, postId = 0) => {
    const obj = {
      id,
      title: '',
      description: '',
      link: '',
    };

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
      currentPosts.push(correctedObj);
      const uiPostObj = {
        id,
        postId,
        visibility: 'fw-bold',
      };
      uiPosts.push(uiPostObj);
      return;
    }

    currentFeeds.push(correctedObj);
    let itemId = 0;
    [...elem.children].forEach((child) => {
      if (child.tagName === 'item') {
        iter(child, itemId += 1);
      }
    });
  };

  iter(channel);

  stateWatcher.main.feeds.splice(0, 0, ...currentFeeds);
  stateWatcher.main.posts.splice(0, 0, ...currentPosts);
};

export default buildRssContainerInState;
