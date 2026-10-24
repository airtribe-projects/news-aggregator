const express = require('express');
const { getPreferences, updatePreferences } = require('../controller/userController');
const { isAuthorized } = require('../middleware/authMiddleware');
const { validatePreferences } = require('../middleware/validateUserMiddleware');

const router = express.Router();

// Every route below needs a valid token
router.use(isAuthorized);

router.get('/', async (req, res) => {
    const preferences = await getPreferences(req.decodedToken.id);
    res.status(200).json({ preferences });
});

router.put('/', validatePreferences, async (req, res) => {
    const preferences = await updatePreferences(req.decodedToken.id, req.body.preferences);
    res.status(200).json({ message: 'Preferences updated', preferences });
});

module.exports = router;
