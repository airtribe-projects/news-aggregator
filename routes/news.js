const express = require('express');
const routes = express.Router();

const { getNews } = require('../controllers/newsController');
const { verifyToken } = require('../middleware/auth');

routes.get('/', verifyToken, getNews);

module.exports = routes;