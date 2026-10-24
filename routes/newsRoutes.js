const express = require('express');
const {
    getNewsForUser,
    searchNews,
    markAsRead,
    markAsFavorite,
    getReadArticles,
    getFavoriteArticles,
} = require('../controller/newsController');
const { isAuthorized } = require('../middleware/authMiddleware');
const { validateArticleId, validateKeyword } = require('../middleware/validateNewsMiddleware');

const router = express.Router();

router.use(isAuthorized);

router.get('/', async (req, res) => {
    const news = await getNewsForUser(req.decodedToken.id);
    res.status(200).json({ news });
});

router.get('/read', async (req, res) => {
    const news = await getReadArticles(req.decodedToken.id);
    res.status(200).json({ news });
});

router.get('/favorites', async (req, res) => {
    const news = await getFavoriteArticles(req.decodedToken.id);
    res.status(200).json({ news });
});

router.get('/search/:keyword', validateKeyword, async (req, res) => {
    const news = await searchNews(req.params.keyword);
    res.status(200).json({ news });
});

router.post('/:id/read', validateArticleId, async (req, res) => {
    const article = await markAsRead(req.decodedToken.id, req.params.id);
    res.status(200).json({ message: 'Article marked as read', article });
});

router.post('/:id/favorite', validateArticleId, async (req, res) => {
    const article = await markAsFavorite(req.decodedToken.id, req.params.id);
    res.status(200).json({ message: 'Article marked as favorite', article });
});

module.exports = router;
