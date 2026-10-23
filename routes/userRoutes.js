const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { usersCollection } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Checks something like "name@example.com"
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Preferences must be an array of non-empty strings, e.g. ['movies', 'comics']
function isValidPreferences(preferences) {
    return Array.isArray(preferences) &&
        preferences.every((item) => typeof item === 'string' && item.trim() !== '');
}

// POST /users/signup - register a new user
router.post('/signup', async (req, res) => {
    const { name, email, password, preferences = [] } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Name, email and password must be text' });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Email is not valid' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!isValidPreferences(preferences)) {
        return res.status(400).json({ message: 'Preferences must be an array of strings' });
    }

    try {
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await usersCollection.insertOne({
            name,
            email,
            password: hashedPassword,
            preferences
        });

        res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

// POST /users/login - log in and get a JWT token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

// GET /users/preferences - get the logged-in user's preferences
router.get('/preferences', auth, async (req, res) => {
    try {
        const user = await usersCollection.findOne({ email: req.userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ preferences: user.preferences });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

// PUT /users/preferences - update the logged-in user's preferences
router.put('/preferences', auth, async (req, res) => {
    const { preferences } = req.body;

    if (!isValidPreferences(preferences)) {
        return res.status(400).json({ message: 'Preferences must be an array of strings' });
    }

    try {
        const result = await usersCollection.updateOne(
            { email: req.userEmail },
            { $set: { preferences } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ preferences });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

module.exports = router;
