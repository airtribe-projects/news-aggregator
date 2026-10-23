const express = require('express');
const router = express.Router();
const { getNews } = require('../controllers/newsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getNews);

module.exports = router;