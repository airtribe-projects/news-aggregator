const express = require("express");
const {
  signUpUser,
  loginUser,
  getUserPreferences,
  updateUserPreferences,
} = require("../controller/usersController");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, preferences } = req.body;

    const user = { name, email, password, preferences };
    const dbUser = await signUpUser(user);
    res.send("User Added Succeesfully");
  } catch (err) {
    console.log("Signup error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    return res.status(200).send({ token: token });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

router.get("/preferences", authMiddleware, async (req, res) => {
  try {
    const preferences = await getUserPreferences(req.userId);
    return res.status(200).send({ preferences });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.message,
    });
  }
});

router.put("/preferences", authMiddleware, async (req, res) => {
  try {
    const { preferences } = req.body;
    if (!Array.isArray(preferences)) {
      return res.status(400).json({
        error: "Preferences must be an Array",
      });
    }

    const updatedPreferences = await updateUserPreferences(
      req.userId,
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
