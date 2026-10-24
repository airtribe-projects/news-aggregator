
const express = require('express');

const {
    getNews
} = require('../controllers/newsController');

const {
    authenticateUser
} = require('../middleware/authMiddleware');

const router = express.Router();

// Protected news endpoint
router.get('/', authenticateUser, getNews);

module.exports = router;
