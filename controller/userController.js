const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readAll, writeAll } = require('../models/userModel');
const { createError } = require('../utils/createError');

const SALT_ROUNDS = 10;

// Store emails in lowercase so the same email can't be registered twice
const normalizeEmail = (email) => email.trim().toLowerCase();

const registerUser = async ({ name, email, password, preferences = [] }) => {
    const users = await readAll();
    email = normalizeEmail(email);

    if (users.find((user) => user.email === email)) {
        throw createError(400, 'Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    users.push({
        id: crypto.randomUUID(),
        name: name.trim(),
        email,
        password: hashedPassword,
        preferences,
        readArticles: [],
        favoriteArticles: [],
    });
    await writeAll(users);
};

const loginUser = async ({ email, password }) => {
    const users = await readAll();
    const user = users.find((user) => user.email === normalizeEmail(email));

    // Same message for wrong email and wrong password, so nobody can check which emails are registered
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw createError(401, 'Invalid email or password');
    }

    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const getPreferences = async (userId) => {
    const users = await readAll();
    const user = users.find((user) => user.id === userId);

    if (!user) {
        throw createError(404, 'User not found');
    }
    return user.preferences;
};

const updatePreferences = async (userId, preferences) => {
    const users = await readAll();
    const user = users.find((user) => user.id === userId);

    if (!user) {
        throw createError(404, 'User not found');
    }
    user.preferences = preferences;
    await writeAll(users);
    return user.preferences;
};

module.exports = { registerUser, loginUser, getPreferences, updatePreferences };
