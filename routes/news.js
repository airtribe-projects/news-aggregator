const express = require('express');
const authenticate = require('../middleware/auth');
const {
    getNews,
    searchNews,
    listRead,
    listFavorites,
    markRead,
    markFavorite
} = require('../controllers/news');

const router = express.Router();

router.get('/search/:keyword', authenticate, searchNews);
router.get('/read', authenticate, listRead);
router.get('/favorites', authenticate, listFavorites);
router.post('/:id/read', authenticate, markRead);
router.post('/:id/favorite', authenticate, markFavorite);
router.get('/', authenticate, getNews);

module.exports = router;
