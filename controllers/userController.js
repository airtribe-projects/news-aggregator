const userModel = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function userSignup(req, res) {
    try {
        const { name, email, password, preferences } = req.body; 
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        } 
        if(typeof  typeof email !== 'string'|| !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (typeof password !== 'string' || password.length < 8 || password.length > 64 ) {
            return res.status(400).json({ message: 'Password must be between 8 and 64 characters' });
        }
        const existingUser = await userModel.findOne({ email });

        if(existingUser){
            return res.status(409).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            preferences
        });
        await newUser.save();
        return res.status(200).json({ message: 'User created successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function userLogin(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: 'User logged in successfully', token });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getPreferences(req, res) {
    try {
        const userId = req.user.id; 
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Invalid user' });
        }
        return res.status(200).json({ message: 'Preferences retrieved successfully', preferences: user.preferences });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function updatePreferences(req, res) {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;
        if (!preferences || !Array.isArray(preferences)) {
            return res.status(400).json({ message: 'Preferences are required and must be an array' });
        }
        const user = await userModel.findByIdAndUpdate(userId, { preferences }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'Invalid user' });
        }
        return res.status(200).json({ message: 'Preferences updated successfully', preferences: user.preferences });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { userSignup, userLogin, getPreferences, updatePreferences };