const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const {
    validateSignup,
    validateLogin,
    validatePreferencesBody,
} = require('../middlewares/validateUser');

const router = express.Router();

router.post('/signup', validateSignup, userController.signup);
router.post('/login', validateLogin, userController.login);

router.get('/preferences', authenticate, userController.getPreferences);
router.put('/preferences', authenticate, validatePreferencesBody, userController.updatePreferences);

module.exports = router;
