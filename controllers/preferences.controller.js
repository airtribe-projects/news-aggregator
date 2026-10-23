const userModel = require("../models/user.model");
const { isValidPreferences } = require("../utils/validators");

const getUserPreferences = async (req, res) => {
  const id = req.user;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ preferences: user.preferences });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changeUserPreferences = async (req, res) => {
  const id = req.user;
  const { preferences } = req.body;
  if (!isValidPreferences(preferences)) {
    return res.status(400).json({ message: "Invalid preferences" });
  }

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.preferences = preferences;
    await user.save();
    res.json({ preferences: user.preferences });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getUserPreferences, changeUserPreferences };
