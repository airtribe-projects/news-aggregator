const users = require("../models/userStore");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Validate email format
const isValidEmail = (email) => {
  return (
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
};

// Validate preferences
const isValidPreferences = (preferences) => {
  return (
    preferences === undefined ||
    (Array.isArray(preferences) &&
      preferences.every(
        (item) => typeof item === "string" && item.trim().length > 0,
      ))
  );
};

// Normalize email consistently
const normalizeEmail = (email) => email.trim().toLowerCase();

// Register a new user
const signup = async (req, res) => {
  try {
    const { name, email, password, preferences } = req.body ?? {};

    // Validate input
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !isValidEmail(email) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Name, valid email, and password of at least 8 characters are required",
      });
    }

    // Validate preferences if supplied
    if (!isValidPreferences(preferences)) {
      return res.status(400).json({
        message: "Preferences must be an array of non-empty strings",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    // Check for existing email
    const existingUser = users.find((user) => user.email === normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length + 1,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      preferences: (preferences ?? []).map((item) => item.trim()),
    };

    users.push(newUser);

    // Never return the password or password hash
    return res.status(200).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        preferences: newUser.preferences,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Log in an existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      !isValidEmail(email) ||
      typeof password !== "string" ||
      password.length === 0
    ) {
      return res.status(400).json({
        message: "A valid email and password are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = users.find((user) => user.email === normalizedEmail);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server authentication is not configured",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getPreferences = (req, res) => {
  const user = users.find((user) => user.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    preferences: user.preferences,
  });
};

const updatePreferences = (req, res) => {
  const { preferences } = req.body ?? {};

  if (
    !Array.isArray(preferences) ||
    !preferences.every(
      (item) => typeof item === "string" && item.trim().length > 0,
    )
  ) {
    return res.status(400).json({
      message: "Preferences must be an array of non-empty strings",
    });
  }

  const user = users.find((user) => user.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  user.preferences = preferences.map((item) => item.trim());

  return res.status(200).json({
    message: "Preferences updated successfully",
    preferences: user.preferences,
  });
};

module.exports = {
  signup,
  login,
  getPreferences,
  updatePreferences,
};
