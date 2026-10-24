const express = require('express');
const authenticate = require('../middleware/auth');
const { signup, login, getPreferences, updatePreferences } = require('../controllers/users');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);

module.exports = router;
