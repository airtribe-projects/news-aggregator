const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getPreferences,
  updatePreferences,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

// Registration and login
router.post("/register", signup);
router.post("/signup", signup);
router.post("/login", login);

// Protected preference routes
router.get("/preferences", authMiddleware, getPreferences);
router.put("/preferences", authMiddleware, updatePreferences);

module.exports = router;
