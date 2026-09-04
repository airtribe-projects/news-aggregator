const crypto = require('crypto');
const axios = require('axios');
const {
    NEWS_API_URL,
    NEWS_API_KEY,
    NEWS_LANGUAGE,
    NEWS_PAGE_SIZE,
    NEWS_REQUEST_TIMEOUT_MS,
    NEWS_CACHE_TTL_MS,
} = require('../config');

const cache = new Map();
const articleIndex = new Map();
let refreshTimer = null;

const isConfigured = () => Boolean(NEWS_API_KEY);

const buildQuery = (preferences) =>
    Array.isArray(preferences) && preferences.length > 0
        ? preferences.join(' OR ')
        : 'general';

const buildArticleId = (article, index) => {
    const basis = article.url || article.title || String(index);
    return crypto.createHash('sha1').update(basis).digest('hex').slice(0, 16);
};

const normaliseArticle = (article, index) => ({
    id: buildArticleId(article, index),
    title: article.title || 'Untitled',
    description: article.description || '',
    url: article.url || '',
    source: (article.source && article.source.name) || 'Unknown',
    author: article.author || '',
    publishedAt: article.publishedAt || null,
});

const readCache = async (key) => {
    const entry = cache.get(key);

    if (!entry) {
        return null;
    }

    if (Date.now() - entry.storedAt > NEWS_CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }

    return entry.news;
};

const writeCache = async (key, news) => {
    cache.set(key, { news, storedAt: Date.now() });
    news.forEach((article) => articleIndex.set(article.id, article));
    return news;
};

const clearCache = async () => {
    cache.clear();
    articleIndex.clear();
};

const findArticleById = async (id) => articleIndex.get(id) || null;

const fetchFromProvider = async (query) => {
    const response = await axios.get(NEWS_API_URL, {
        params: {
            q: query,
            language: NEWS_LANGUAGE,
            pageSize: NEWS_PAGE_SIZE,
            apiKey: NEWS_API_KEY,
        },
        timeout: NEWS_REQUEST_TIMEOUT_MS,
    });

    const articles = Array.isArray(response.data.articles) ? response.data.articles : [];
    return articles.map(normaliseArticle);
};

const fetchByQuery = async (query) => {
    if (!isConfigured()) {
        return { news: [], source: 'unconfigured' };
    }

    const cached = await readCache(query);

    if (cached) {
        return { news: cached, source: 'cache' };
    }

    const news = await fetchFromProvider(query);
    await writeCache(query, news);

    return { news, source: 'api' };
};

const fetchNews = async (preferences) => fetchByQuery(buildQuery(preferences));

const searchNews = async (keyword) => fetchByQuery(keyword);

const refreshCache = async () => {
    if (!isConfigured()) {
        return [];
    }

    const queries = Array.from(cache.keys());
    const results = [];

    for (const query of queries) {
        try {
            const news = await fetchFromProvider(query);
            await writeCache(query, news);
            results.push({ query, count: news.length, refreshed: true });
        } catch (error) {
            results.push({ query, refreshed: false, reason: error.message });
        }
    }

    return results;
};

const startPeriodicRefresh = (intervalMs) => {
    if (!intervalMs || intervalMs <= 0 || refreshTimer) {
        return null;
    }

    refreshTimer = setInterval(() => {
        refreshCache()
            .then((results) => {
                if (results.length > 0) {
                    console.log(`Cache refresh: updated ${results.length} cached query/queries`);
                }
            })
            .catch((error) => console.error('Cache refresh failed', error.message));
    }, intervalMs);

    refreshTimer.unref();

    return refreshTimer;
};

const stopPeriodicRefresh = () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
};

const toApiError = (error) => {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { status: 504, message: 'The news provider took too long to respond' };
    }

    if (error.response) {
        const upstream = error.response.status;

        if (upstream === 401 || upstream === 403) {
            return { status: 502, message: 'The news provider rejected our API key' };
        }

        if (upstream === 429) {
            return { status: 502, message: 'The news provider rate limit has been reached' };
        }

        return { status: 502, message: `The news provider responded with status ${upstream}` };
    }

    return { status: 502, message: 'Could not reach the news provider' };
};

module.exports = {
    fetchNews,
    searchNews,
    findArticleById,
    refreshCache,
    startPeriodicRefresh,
    stopPeriodicRefresh,
    clearCache,
    isConfigured,
    buildQuery,
    toApiError,
};
