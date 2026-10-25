
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;


// Signup
const signUp = async (req, res) => {
    try {
        const { name, email, password, preferences } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            preferences: Array.isArray(preferences) ? preferences : [],
        });

        return res.status(200).json({
            message: "User registered successfully",
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        console.error("Signup error:", error.message);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// Login

const logIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from .env");
        }

        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


// Get preferences
const getPreferences = (req, res) => {
    return res.status(200).json({
        preferences: req.user.preferences,
    });
};

// Update preferences
const updatePreferences = async (req, res) => {
    try {
        const { preferences } = req.body;

        if (!Array.isArray(preferences)) {
            return res.status(400).json({
                message: "Preferences must be an array",
            });
        }

        req.user.preferences = preferences;
        await req.user.save();

        return res.status(200).json({
            message: "Preferences updated successfully",
            preferences: req.user.preferences,
        });
    } catch (error) {
        console.error("Preferences update error:", error.message);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = {
    signUp,
    logIn,
    getPreferences,
    updatePreferences,
};
