const express = require('express');
const routes = express.Router();

const { signup, login, getPreferences, updatePreferences } = require('../controllers/usersController');
const { verifyToken } = require('../middleware/auth');

routes.post('/signup', signup);
routes.post('/register', signup);
routes.post('/login', login);
routes.get('/preferences', verifyToken, getPreferences);
routes.put('/preferences', verifyToken, updatePreferences);

module.exports = routes;