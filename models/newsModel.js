const crypto = require('crypto');
const axios = require('axios');
const { createError } = require('../utils/createError');

// Free plan only gives 100 requests a day, so don't refresh too often
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const UNUSED_AFTER_MS = 3 * 60 * 60 * 1000; // 3 hours

const newsApi = axios.create({
    baseURL: 'https://newsapi.org/v2',
    timeout: 5000,
});

// query -> { articles, fetchedAt, lastUsedAt }
const cache = new Map();

// Articles from NewsAPI don't have an id, so make one from the url
const makeId = (url) => crypto.createHash('sha256').update(url).digest('hex').slice(0, 16);

const formatArticle = (article) => ({
    id: makeId(article.url),
    title: article.title,
    description: article.description,
    url: article.url,
    source: article.source.name,
    publishedAt: article.publishedAt,
});

const requestArticles = async (query) => {
    try {
        const response = await newsApi.get('/everything', {
            params: { q: query, language: 'en', sortBy: 'publishedAt', pageSize: 20 },
            headers: { 'X-Api-Key': process.env.NEWS_API_KEY },
        });
        // Deleted articles come back with the title "[Removed]"
        return response.data.articles.filter((article) => article.title !== '[Removed]').map(formatArticle);
    } catch (err) {
        // No response means timeout or network problem
        if (!err.response) {
            throw createError(503, 'News service is unavailable, please try again later');
        }
        if (err.response.status === 429) {
            throw createError(503, 'News service limit reached, please try again later');
        }
        console.error('NewsAPI error:', err.response.status, err.response.data.message);
        throw createError(502, 'Failed to fetch news');
    }
};

const fetchArticles = async (query) => {
    const entry = cache.get(query);
    const now = Date.now();

    if (entry && now - entry.fetchedAt < CACHE_TTL_MS) {
        console.log(`Cache hit: ${query}`);
        entry.lastUsedAt = now;
        return entry.articles;
    }

    try {
        const articles = await requestArticles(query);
        cache.set(query, { articles, fetchedAt: now, lastUsedAt: now });
        return articles;
    } catch (err) {
        // If the API call fails, return the old cached articles if we have them
        if (entry) {
            entry.lastUsedAt = now;
            return entry.articles;
        }
        throw err;
    }
};

const findCachedArticle = (id) => {
    for (const entry of cache.values()) {
        const article = entry.articles.find((article) => article.id === id);
        if (article) {
            return article;
        }
    }
    return null;
};

const refreshCache = async () => {
    for (const [query, entry] of cache) {
        // Nobody asked for this search in a while, remove it instead of refreshing
        if (Date.now() - entry.lastUsedAt > UNUSED_AFTER_MS) {
            cache.delete(query);
            continue;
        }
        try {
            entry.articles = await requestArticles(query);
            entry.fetchedAt = Date.now();
        } catch (err) {
            console.error(`Cache refresh failed for "${query}": ${err.message}`);
        }
    }
};

// unref() so the timer doesn't stop the process from exiting (e.g. in tests)
const startCacheRefresh = () => setInterval(refreshCache, CACHE_TTL_MS).unref();

module.exports = { fetchArticles, findCachedArticle, refreshCache, startCacheRefresh };
