const express = require("express");
const router = express.Router();
const { loginUser, signUpUser, getPreferences, updatePreferences } = require("../controller/usersController");
const authMiddleware = require("../middleware/auth");

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, preferences } = req.body;
        const data = await signUpUser({ name, email, password, preferences });
        return res.status(201).json({ message: "User registered", data });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await loginUser({ email, password });
        return res.status(200).json({ message: "Login successful", token: token });
    } catch (err) {
        const status = err.message === "User not found" ? 404 : 401;
        return res.status(status).json({ message: err.message });
    }
});


router.get("/preferences", authMiddleware, async (req, res) => {
    try {
        const user = req.body;
        const data = await getPreferences(user.userId);
        return res.status(200).json({ data })
    } catch (err) {
        return res.status(err.status || 500).json({
            error: err.message,
        });
    }
})


router.put("/preferences", authMiddleware, async (req, res) => {
    try {
        const { preferences } = req.body;
        if (!Array.isArray(preferences)) {
            return res.status(400).json({
                error: "Preferences must be an Array",
            });
        }

        const user = req.body;
        const updatedPreferences = await updatePreferences(
            user.userId,
            preferences,
        );
        return res.status(200).json({
            message: "Preferences updated successfully",
            preferences: updatedPreferences,
        });
    } catch (err) {
        return res.status(err.status || 500).json({
            error: err.message,
        });
    }
});




module.exports = router;
