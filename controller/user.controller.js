const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SALT_ROUNDS } = require('../utils/constants');

const usersModel = require("../model/user.model");

// Register a new user
const registerUser = async (user) => {
    const newUser = new usersModel({
        name: user.name,
        email: user.email,
        password: user.password,
        preferences: user.preferences || []
    });

    await newUser.validate();

    // Generate a salt for password hashing
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    // Hash the user's password using the generated salt
    const hashedPassword = await bcrypt.hash(user.password, salt);
    newUser.password = hashedPassword;

    // Save the new user to the database and return the saved user object
    try {
        const dbUser = await newUser.save();
        const response = {
            _id: dbUser._id,
            name: dbUser.name,
            email: dbUser.email,
            preferences: dbUser.preferences
        };
        return response;
    }
    // Handle any errors that occur during user registration
    catch (error) {
        if (error.code === 11000) {
            throw new Error("Email already exists", error);
        }
        if (error.name === 'ValidationError') {
            throw error;
        }
        throw new Error("Error occurred while registering user");
    }
};

// Login an existing user
const loginUser = async (email, password) => {
    try {
        const input = new usersModel({ email, password });
        const validationError = input.validateSync(['email', 'password']);
        if (validationError) {
            throw validationError;
        }

        // Find the user in the database by email
        const dbUser = await usersModel.findOne({ email: email });
        if (!dbUser) {
            throw new Error("User not found");
        }

        // Compare the provided password with the hashed password stored in the database
        const isSamePassword = await bcrypt.compare(password, dbUser.password);
        if (!isSamePassword) {
            throw new Error("Invalid Password");
        }

        // Create a payload for the JWT token with the user's ID and role
        const payload = {
            id: dbUser._id,
            name: dbUser.name,
        };

        // Generate a JWT token with the payload and a secret key, set to expire in 1 hour
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        return { token };
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            throw error;
        }
        throw new Error(error.message);
    }
};

// Get user preferences
const getUserPreferences = async (userId) => {
    try {
        // Find the user in the database by ID and select only the preferences field
        const user = await usersModel.findById(userId).select('preferences');
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    // Handle any errors that occur during the retrieval of user preferences
    catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};

// Update user preferences
const updateUserPreferences = async (userId, preferences) => {
    try {
        // Find the user in the database by ID and update the preferences field
        const updatedUser = await usersModel.findByIdAndUpdate(
            userId,
            { preferences },
            { new: true } // Return the updated user object
        );
        // If the user is not found, throw an error
        if (!updatedUser) {
            throw new Error("User not found");
        }
        // Return the updated user object with the new preferences
        delete updatedUser.password;
        return updatedUser;
    }
    // Handle any errors that occur during the update of user preferences
    catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserPreferences,
    updateUserPreferences,
};