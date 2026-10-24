
const { registerUser, loginUser, getUserPreferences, updatePreferences  } = require('../services/userService');

// Register new user
const signup = async (req, res, next) => {
    try {
        // Call service layer for registration
        const user = await registerUser(req.body);

        // Return successful response
        return res.status(200).json({
            message: 'User registered successfully',
            user
        });

    } catch (error) {
        // Forward errors to centralized error middleware
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        // Call service to validate credentials and generate JWT
        const { token } = await loginUser(req.body);

        // Return token to the client
        return res.status(200).json({
            message: 'Login successful',
            token
        });

    } catch (error) {
        // Forward errors to centralized error handler
        next(error);
    }
};


const getPreferences = async (req, res, next) => {
    try {
        // Get user ID from verified JWT
        const userId = req.user.id;

        // Fetch preferences from service
        const preferences = await getUserPreferences(userId);

        return res.status(200).json({ preferences });
    } catch (error) {
        next(error);
    }
};


const putPreferences = async (req, res, next) => {
    try {
        // Get authenticated user ID from JWT
        const userId = req.user.id;

        // Get validated preferences from request body
        const { preferences } = req.body;

        // Update preferences using service layer
        const updatedPreferences = await  updatePreferences(
            userId,
            preferences
        );

        // Return updated preferences
        return res.status(200).json({
            message: 'Preferences updated successfully',
            preferences: updatedPreferences
        });

    } catch (error) {
        next(error);
    }
};



module.exports = {
    signup,
    login,
    getPreferences,
    putPreferences
};
