import axios from 'axios';

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

export default makeRequest;
