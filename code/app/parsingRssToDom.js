const parsingRssToDom = (dataRss) => {
  const parser = new DOMParser();
  const dataDom = parser.parseFromString(dataRss, 'application/xml');
  if (dataDom.documentElement.tagName !== 'rss') {
    throw new Error('RSS invalid');
  }
  return dataDom;
};

export default parsingRssToDom;
