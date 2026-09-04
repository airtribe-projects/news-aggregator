const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS } = require('../config');

const signup = async (req, res, next) => {
    try {
        const { name, email, password, preferences } = req.body;

        if (userModel.findByEmail(email)) {
            return next({ status: 409, message: 'An account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = userModel.create({ name, email, password: hashedPassword, preferences });

        return res.status(200).json({
            message: 'User registered successfully',
            user: userModel.toPublic(user),
        });
    } catch (error) {
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = userModel.findByEmail(email);

        if (!user) {
            return next({ status: 401, message: 'Invalid email or password' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return next({ status: 401, message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({ token });
    } catch (error) {
        return next(error);
    }
};

module.exports = { signup, login };

const getPreferences = (req, res) => {
    return res.status(200).json({ preferences: req.user.preferences });
};

const updatePreferences = (req, res) => {
    req.user.preferences = req.body.preferences;

    return res.status(200).json({
        message: 'Preferences updated successfully',
        preferences: req.user.preferences,
    });
};

module.exports.getPreferences = getPreferences;
module.exports.updatePreferences = updatePreferences;
