const bcrypt = require("bcrypt");
const SALT_ROUNDS = 8;
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const {
  isValidPreferences,
  isValidEmail,
  isValidPassword,
} = require("../utils/validators");

const signupController = async (req, res) => {
  const { name, email, password, preferences } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email id" });
  }

  if (!isValidPassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be 8–72 characters" });
  }
  if (preferences !== undefined && !isValidPreferences(preferences)) {
    return res.status(400).json({ message: "Invalid preferences" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      preferences,
    });

    res.status(200).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      message: "User created successfully",
    }); //test uses 200 instead of 201
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email id has to be unique" });
    }
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password || !email) {
      return res.status(400).json({ message: "Input fields are missing" });
    }
    const user = await userModel.findOne({ email });
    if (user === null) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ message: "User logged in successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signupController, loginController };
