const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { users } = require('../data/store');

const validPrefs = (p) =>
    Array.isArray(p) && p.every(x => typeof x === 'string' && x.trim() !== '');


exports.signup = async (req, res) => {
    try {
        const { name, email, password, preferences } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email and password are required' });
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        if (preferences !== undefined && !validPrefs(preferences)) {
            return res.status(400).json({ message: 'preferences must be an array of non-empty strings' });
        }

        const user = users.find(user => user.email === email)

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({ name, email, password: hashedPassword, preferences: preferences || [] });

        res.status(200).json({ message: 'User registered successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    console.log("login called"); // Debugging line

    try {
        const { email, password } = req.body;
        console.log('Login request body:', req.body); // Debugging line

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const user = users.find(user => user.email === email)

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Wrong Password Invalid credentials !' });
        }

        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token });
    } catch (e) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPreferences = (req, res) => {
    const user = users.find(u => u.email === req.user.email);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ preferences: user.preferences });
};

exports.updatePreferences = (req, res) => {

    const user = users.find(u => u.email === req.user.email);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const { preferences } = req.body;

    if (!validPrefs(preferences)) {
        return res.status(400).json({ message: 'preferences must be an array of non-empty strings' });
    }
    user.preferences = preferences;

    res.status(200).json({ message: 'Preferences updated', preferences });
};