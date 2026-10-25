const express = require("express");

const {
    signUp,
    logIn,
    getPreferences,
    updatePreferences,
} = require("../controllers/userController");

const authenticateToken = require("../middleware/auth");
const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.get("/preferences", authenticateToken, getPreferences);
router.put("/preferences", authenticateToken, updatePreferences);

module.exports = router;