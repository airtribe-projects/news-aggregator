
const express = require('express');

const { signup, login, getPreferences, putPreferences } = require('../controllers/userController');
const { validateSignup, validateLogin, validatePreferences } = require('../validators/userValidator');
const { authenticateUser } = require('../middleware/authMiddleware');

const router = express.Router();

// User registration endpoints
router.post('/signup', validateSignup, signup);
router.post('/register', validateSignup, signup);

// User login endpoint
router.post('/login', validateLogin, login);

// Protected routes
router.get('/preferences', authenticateUser, getPreferences);

router.put(
    '/preferences',
    authenticateUser,
    validatePreferences,
    putPreferences
);

module.exports = router;
