const express = require('express');
const { usersCollection } = require('../db');
const auth = require('../middleware/auth');
const { getNews, findArticleById } = require('../services/newsService');

const router = express.Router();

// Every /news route needs a logged-in user.
router.use(auth);

// Turn a NewsAPI error into a clear response for the user.
function sendNewsError(res, err) {
    const message = err.response ? err.response.data.message : err.message;
    res.status(502).json({ message: 'Failed to fetch news', error: message });
}

// GET /news - news articles based on the logged-in user's preferences
router.get('/', async (req, res) => {
    try {
        const user = await usersCollection.findOne({ email: req.userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // e.g. ['movies', 'comics'] becomes "movies OR comics"
        const query = user.preferences.length > 0 ? user.preferences.join(' OR ') : 'news';
        const news = await getNews(query);

        res.status(200).json({ news });
    } catch (err) {
        sendNewsError(res, err);
    }
});

// GET /news/read - all articles the user marked as read
router.get('/read', async (req, res) => {
    try {
        const user = await usersCollection.findOne({ email: req.userEmail });
        res.status(200).json({ news: user.readArticles || [] });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

// GET /news/favorites - all articles the user marked as favorite
router.get('/favorites', async (req, res) => {
    try {
        const user = await usersCollection.findOne({ email: req.userEmail });
        res.status(200).json({ news: user.favoriteArticles || [] });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

// GET /news/search/:keyword - search news by keyword
router.get('/search/:keyword', async (req, res) => {
    try {
        const news = await getNews(req.params.keyword);
        res.status(200).json({ news });
    } catch (err) {
        sendNewsError(res, err);
    }
});

// POST /news/:id/read - mark an article as read
router.post('/:id/read', async (req, res) => {
    const article = findArticleById(req.params.id);
    if (!article) {
        return res.status(404).json({ message: 'Article not found. Fetch news first, then use an article id from the list.' });
    }

    try {
        // $addToSet only adds the article if it is not already in the list
        await usersCollection.updateOne({ email: req.userEmail }, { $addToSet: { readArticles: article } });
        res.status(200).json({ message: 'Article marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

// POST /news/:id/favorite - mark an article as favorite
router.post('/:id/favorite', async (req, res) => {
    const article = findArticleById(req.params.id);
    if (!article) {
        return res.status(404).json({ message: 'Article not found. Fetch news first, then use an article id from the list.' });
    }

    try {
        await usersCollection.updateOne({ email: req.userEmail }, { $addToSet: { favoriteArticles: article } });
        res.status(200).json({ message: 'Article marked as favorite' });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

module.exports = router;
