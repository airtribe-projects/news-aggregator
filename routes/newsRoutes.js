const express = require('express');
const newsController = require('../controllers/newsController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', newsController.getNews);
router.get('/read', newsController.getReadArticles);
router.get('/favorites', newsController.getFavoriteArticles);
router.get('/search/:keyword', newsController.searchNews);

router.post('/:id/read', newsController.markAsRead);
router.post('/:id/favorite', newsController.markAsFavorite);

module.exports = router;
