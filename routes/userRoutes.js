const express = require('express');
const { registerUser, loginUser } = require('../controller/userController');
const { validateRegister, validateLogin } = require('../middleware/validateUserMiddleware');

const router = express.Router();

const register = async (req, res) => {
    await registerUser(req.body);
    res.status(200).json({ message: 'User registered successfully' });
};

// /signup is what the tests use, /register is from the assignment steps
router.post('/signup', validateRegister, register);
router.post('/register', validateRegister, register);

router.post('/login', validateLogin, async (req, res) => {
    const token = await loginUser(req.body);
    res.status(200).json({ token });
});

module.exports = router;
