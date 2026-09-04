const newsService = require('../services/newsService');

const getNews = async (req, res, next) => {
    try {
        const { news, source } = await newsService.fetchNews(req.user.preferences);

        return res.status(200).json({
            news,
            count: news.length,
            preferences: req.user.preferences,
            source,
        });
    } catch (error) {
        return next(newsService.toApiError(error));
    }
};

const searchNews = async (req, res, next) => {
    const keyword = String(req.params.keyword || '').trim();

    if (keyword.length === 0) {
        return next({ status: 400, message: 'A search keyword is required' });
    }

    try {
        const { news, source } = await newsService.searchNews(keyword);

        return res.status(200).json({
            keyword,
            news,
            count: news.length,
            source,
        });
    } catch (error) {
        return next(newsService.toApiError(error));
    }
};

const markArticle = async (req, res, next, listName, label) => {
    try {
        const article = await newsService.findArticleById(req.params.id);

        if (!article) {
            return next({
                status: 404,
                message: `No article with id ${req.params.id} has been fetched yet`,
            });
        }

        const list = req.user[listName];
        const alreadyMarked = list.some((saved) => saved.id === article.id);

        if (!alreadyMarked) {
            list.push({ ...article, markedAt: new Date().toISOString() });
        }

        return res.status(200).json({
            message: alreadyMarked
                ? `Article was already marked as ${label}`
                : `Article marked as ${label}`,
            article,
            count: list.length,
        });
    } catch (error) {
        return next(error);
    }
};

const markAsRead = (req, res, next) => markArticle(req, res, next, 'readArticles', 'read');

const markAsFavorite = (req, res, next) =>
    markArticle(req, res, next, 'favoriteArticles', 'favorite');

const getReadArticles = (req, res) =>
    res.status(200).json({
        news: req.user.readArticles,
        count: req.user.readArticles.length,
    });

const getFavoriteArticles = (req, res) =>
    res.status(200).json({
        news: req.user.favoriteArticles,
        count: req.user.favoriteArticles.length,
    });

module.exports = {
    getNews,
    searchNews,
    markAsRead,
    markAsFavorite,
    getReadArticles,
    getFavoriteArticles,
};
