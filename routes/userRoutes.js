const express = require('express');
const router = express.Router();
const { userSignup, userLogin, getPreferences, updatePreferences } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/signup', userSignup);
router.post('/login', userLogin);
router.get('/preferences', authMiddleware, getPreferences);
router.put('/preferences', authMiddleware, updatePreferences);

module.exports = router;