const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserPreferences, updateUserPreferences } = require("../controller/user.controller");
const {
    BadRequestErrorResponse,
    CreatedResponse,
    ErrorResponse,
} = require("../utils/response");
const { isAuthorized } = require("../middleware/auth.middleware");

// POST /users/signup route
router.post("/signup", async (req, res) => {
    // Validate request body
    const user = req.body || {};
    if (!user.name || !user.email || !user.password) {
        return res.status(400).json(
            BadRequestErrorResponse('Missing required fields: name, email, password'),
        );
    }

    // Call the registerUser function and handle the response
    try {
        const dbUser = await registerUser(user);
        return res.status(200).json(CreatedResponse(dbUser));
    }
    // Handle errors
    catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors)
                .map((validationError) => validationError.message)
                .join(', ');
            return res.status(400).json(BadRequestErrorResponse(message));
        }
        // Check if the error is due to email already existing
        if (error.message === "Email already exists") {
            return res.status(409).json(BadRequestErrorResponse(error.message));
        }
        // For other errors, return a generic error response
        return res.status(500).json(
            ErrorResponse('Error occurred while registering user'),
        );
    }
});

// POST /users/login route
router.post("/login", async (req, res) => {
    // Validate request body
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json(
            BadRequestErrorResponse('Missing required fields: email, password'),
        );
    }

    // Call the loginUser function and handle the response
    try {
        const { token } = await loginUser(email, password);
        return res.status(200).json(
            { token }
        );
    }
    // Handle errors
    catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const message = Object.values(error.errors)
                .map((validationError) => validationError.message)
                .join(', ');
            return res.status(400).json(BadRequestErrorResponse(message));
        }
        if (error.message === "User not found" || error.message === "Invalid Password") {
            return res.status(401).json(
                ErrorResponse('Invalid email or password'),
            );
        }
        return res.status(500).json(
            ErrorResponse('Error occurred while logging in'),
        );
    }
});

// GET /users/preferences route (protected)
router.get("/preferences", isAuthorized, async (req, res) => {
    // Implementation for fetching user preferences
    const userId = req.decodedToken.id
    if (!userId) {
        return res.status(400).json(
            BadRequestErrorResponse('User ID is required'),
        );
    }
    // Call the getUserPreferences function and handle the response
    try {
        const user = await getUserPreferences(userId);
        return res.status(200).json(
            { preferences: user.preferences }
        );
    }
    // Handle errors
    catch (error) {
        console.error(error);
        // Check if the error is due to user not found
        if (error.message === "User not found") {
            return res.status(404).json(
                ErrorResponse('User not found'),
            );
        }
        // For other errors, return a generic error response
        return res.status(500).json(
            ErrorResponse('Error occurred while fetching user preferences'),
        );
    }
});

router.put("/preferences", isAuthorized, async (req, res) => {
    const userId = req.decodedToken.id;
    // Validate request body
    if (!userId) {
        return res.status(400).json(
            BadRequestErrorResponse('User ID is required'),
        );
    }
    // Validate preferences in request body
    const { preferences } = req.body || {};
    if (!preferences || !Array.isArray(preferences)) {
        return res.status(400).json(
            BadRequestErrorResponse('Invalid preferences format'),
        );
    }

    // Call the updateUserPreferences function and handle the response
    try {
        const updatedUser = await updateUserPreferences(userId, preferences);
        return res.status(200).json(
            { preferences: updatedUser.preferences }
        );
    }
    // Handle errors
    catch (error) {
        console.error(error);
        // Check if the error is due to user not found
        if (error.message === "User not found") {
            return res.status(404).json(
                ErrorResponse('User not found'),
            );
        }
        // For other errors, return a generic error response
        return res.status(500).json(
            ErrorResponse('Error occurred while updating user preferences'),
        );
    }
});

module.exports = {
    userRoutes: router,
};