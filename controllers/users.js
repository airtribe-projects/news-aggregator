const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
    isPlainObject,
    isValidEmail,
    isValidPassword,
    isValidName,
    normalizePreferences
} = require('../utils/validation');

const JWT_SECRET = process.env.JWT_SECRET || 'news-aggregator-secret';

async function signup(req, res) {
    if (!isPlainObject(req.body)) {
        return res.status(400).json({ message: 'Invalid registration input' });
    }

    const { name, email, password, preferences } = req.body;

    if (!isValidName(name) || !isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Invalid registration input' });
    }

    const normalizedPreferences = normalizePreferences(preferences);
    if (normalizedPreferences === null) {
        return res.status(400).json({ message: 'Invalid registration input' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            preferences: normalizedPreferences
        });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({ message: 'Email already registered' });
        }
        throw err;
    }

    return res.status(200).json({ message: 'User created' });
}

async function login(req, res) {
    if (!isPlainObject(req.body)) {
        return res.status(400).json({ message: 'Invalid login input' });
    }

    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== 'string' || password.length === 0) {
        return res.status(400).json({ message: 'Invalid login input' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
}

async function findUserByEmail(email) {
    return User.findOne({ email });
}

async function getAllUsers() {
    return User.find({}, 'preferences').lean();
}

function getPreferences(req, res) {
    return res.status(200).json({ preferences: req.user.preferences });
}

async function updatePreferences(req, res) {
    if (!isPlainObject(req.body) || !Object.prototype.hasOwnProperty.call(req.body, 'preferences')) {
        return res.status(400).json({ message: 'Invalid preferences' });
    }

    const normalizedPreferences = normalizePreferences(req.body.preferences);
    if (normalizedPreferences === null) {
        return res.status(400).json({ message: 'Invalid preferences' });
    }

    req.user.preferences = normalizedPreferences;
    await req.user.save();
    return res.status(200).json({ preferences: req.user.preferences });
}

module.exports = {
    signup,
    login,
    getPreferences,
    updatePreferences,
    findUserByEmail,
    getAllUsers
};
