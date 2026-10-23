const cache = new Map();
const ttl = 10 * 1000 * 60;
const buildKey = (preferences) => {
  return [...preferences]
    .map((k) => k.toLowerCase())
    .sort()
    .join("|");
};
const setCache = (preferences, articles) => {
  const key = buildKey(preferences);

  cache.set(key, {
    data: articles,
    timestamp: Date.now(),
  });
};

const getCache = (preferences) => {
  const key = buildKey(preferences);
  //if key is present gimme the value
  if (cache.has(key)) {
    const entry = cache.get(key);
    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  } else {
    return null;
  }
};

module.exports = { setCache, getCache };
