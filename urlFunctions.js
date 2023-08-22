function getHeadDomain(url) {
  const startIndex = url.indexOf('//');
  if (startIndex === -1) return url;

  const endIndex = url.indexOf('/', startIndex + 2);
  if (endIndex === -1) return url.substring(startIndex + 2);

  return url.substring(startIndex + 2, endIndex);
}