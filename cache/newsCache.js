const { LRUCache } = require('lru-cache');
const axios = require('axios');
const crypto = require('crypto');

const TTL_MS = 6 * 60 * 60 * 1000;

const cache = new LRUCache({
    max: 100,
    ttl: TTL_MS,
    allowStale: true,
    updateAgeOnGet: false
});

function preferenceKey(preferences) {
    return [...preferences].map((item) => item.toLowerCase()).sort().join('|');
}

function sanitize(value) {
    if (typeof value !== 'string') {
        return value;
    }
    return value.replace(/[\u0000-\u001F\u007F]/g, ' ');
}

function mapArticle(article) {
    const url = article.url || '';
    return {
        id: crypto.createHash('sha1').update(url).digest('hex'),
        title: sanitize(article.title),
        description: sanitize(article.description),
        url: article.url,
        source: article.source && article.source.name,
        publishedAt: article.publishedAt
    };
}

async function fetchFromNewsApi(preferences) {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
        return [];
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
            q: preferences.join(' OR '),
            language: 'en',
            pageSize: 20,
            sortBy: 'publishedAt',
            apiKey
        },
        timeout: 8000
    });

    const articles = Array.isArray(response.data && response.data.articles) ? response.data.articles : [];
    return articles.map(mapArticle);
}

async function get(key, { allowStale = false } = {}) {
    return cache.get(key, { allowStale }) || null;
}

async function set(key, articles) {
    const entry = { articles, fetchedAt: Date.now() };
    cache.set(key, entry);
    return entry;
}

async function getOrFetch(key, fetcher) {
    const fresh = cache.get(key, { allowStale: false });
    if (fresh) {
        return fresh.articles;
    }

    try {
        const articles = await fetcher();
        await set(key, articles);
        return articles;
    } catch (err) {
        const stale = cache.get(key, { allowStale: true });
        if (stale) {
            return stale.articles;
        }
        throw err;
    }
}

async function loadNewsForPreferences(preferences) {
    if (!Array.isArray(preferences) || preferences.length === 0) {
        return [];
    }

    if (!process.env.NEWS_API_KEY) {
        return [];
    }

    return getOrFetch(preferenceKey(preferences), () => fetchFromNewsApi(preferences));
}

function startNewsCacheRefresh(intervalMs = TTL_MS) {
    const { getAllUsers } = require('../controllers/users');

    setInterval(async () => {
        try {
            const users = await getAllUsers();
            const keys = new Set();

            for (const user of users) {
                if (!Array.isArray(user.preferences) || user.preferences.length === 0) {
                    continue;
                }
                const key = preferenceKey(user.preferences);
                if (keys.has(key)) {
                    continue;
                }
                keys.add(key);
                try {
                    const articles = await fetchFromNewsApi(user.preferences);
                    await set(key, articles);
                } catch (err) {
                    console.error('News cache refresh failed', err.message);
                }
            }
        } catch (err) {
            console.error('News cache refresh failed', err.message);
        }
    }, intervalMs).unref();
}

module.exports = {
    preferenceKey,
    get,
    set,
    getOrFetch,
    loadNewsForPreferences,
    startNewsCacheRefresh
};
