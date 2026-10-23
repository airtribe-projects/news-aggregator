const axios = require('axios');

// Cache: { "movies OR comics": [articles], ... }
// Saves us from calling NewsAPI again for a search we already made.
const cache = {};

// Fetch articles from NewsAPI for a search query.
async function fetchFromNewsAPI(query) {
    const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
            q: query,
            pageSize: 10,
            apiKey: process.env.NEWS_API_KEY
        }
    });

    // NewsAPI articles have no id, so we make one from the article's url.
    return response.data.articles.map((article) => ({
        id: Buffer.from(article.url).toString('base64url'),
        ...article
    }));
}

// Return articles from the cache if we have them, otherwise fetch and cache them.
async function getNews(query) {
    if (cache[query]) {
        return cache[query];
    }

    const articles = await fetchFromNewsAPI(query);
    cache[query] = articles;
    return articles;
}

// Look through all cached articles for one with this id.
function findArticleById(id) {
    for (const query in cache) {
        const article = cache[query].find((article) => article.id === id);
        if (article) {
            return article;
        }
    }
    return null;
}

// Every 15 minutes, re-fetch every cached query so the news stays fresh.
function startCacheRefresh() {
    setInterval(async () => {
        for (const query in cache) {
            try {
                cache[query] = await fetchFromNewsAPI(query);
            } catch (err) {
                console.log(`Could not refresh news for "${query}":`, err.message);
            }
        }
    }, 15 * 60 * 1000);
}

module.exports = { getNews, findArticleById, startCacheRefresh };
