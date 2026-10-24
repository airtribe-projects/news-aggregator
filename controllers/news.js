const { loadNewsForPreferences } = require('../cache/newsCache');

async function getNews(req, res) {
    try {
        const news = await loadNewsForPreferences(req.user.preferences);
        return res.status(200).json({ news });
    } catch (err) {
        return res.status(502).json({ message: 'Failed to fetch news' });
    }
}

async function searchNews(req, res) {
    const keyword = decodeURIComponent(req.params.keyword || '').trim();
    if (!keyword) {
        return res.status(400).json({ message: 'Invalid search keyword' });
    }

    try {
        const news = await loadNewsForPreferences(req.user.preferences);
        const needle = keyword.toLowerCase();
        const matches = news.filter((article) => {
            const title = typeof article.title === 'string' ? article.title.toLowerCase() : '';
            const description = typeof article.description === 'string' ? article.description.toLowerCase() : '';
            return title.includes(needle) || description.includes(needle);
        });
        return res.status(200).json({ news: matches });
    } catch (err) {
        return res.status(502).json({ message: 'Failed to fetch news' });
    }
}

function listRead(req, res) {
    return res.status(200).json({ news: req.user.readArticles || [] });
}

function listFavorites(req, res) {
    return res.status(200).json({ news: req.user.favoriteArticles || [] });
}

async function markArticle(req, res, field) {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
        return res.status(400).json({ message: 'Invalid article id' });
    }

    let news;
    try {
        news = await loadNewsForPreferences(req.user.preferences);
    } catch (err) {
        return res.status(502).json({ message: 'Failed to fetch news' });
    }

    const article = news.find((item) => item.id === id);
    if (!article) {
        return res.status(404).json({ message: 'Article not found' });
    }

    const alreadySaved = req.user[field].some((item) => item.id === id);
    if (!alreadySaved) {
        req.user[field].push(article);
        await req.user.save();
    }

    return res.status(200).json({ message: 'Updated', article });
}

function markRead(req, res) {
    return markArticle(req, res, 'readArticles');
}

function markFavorite(req, res) {
    return markArticle(req, res, 'favoriteArticles');
}

module.exports = {
    getNews,
    searchNews,
    listRead,
    listFavorites,
    markRead,
    markFavorite
};
