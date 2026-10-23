const express = require("express");

const {
  signupController,
  loginController,
} = require("../controllers/user.controller");
const {
  changeUserPreferences,
  getUserPreferences,
} = require("../controllers/preferences.controller");
const { isUserAuthorised } = require("../middlewares/auth");
const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/preferences", isUserAuthorised, getUserPreferences);
router.put("/preferences", isUserAuthorised, changeUserPreferences);
module.exports = router;
