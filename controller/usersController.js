const usersModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const SALT_ROUND = 10;
const jwt = require("jsonwebtoken");

const signUpUser = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, SALT_ROUND);

  const dbUser = await usersModel.create({
    ...user,
    password: hashedPassword,
  });

  return dbUser;
};

const loginUser = async (email, password) => {
  const user = await usersModel.findOne({ email });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const isSamePassword = await bcrypt.compare(password, user.password);

  if (!isSamePassword) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return token;
};

const getUserPreferences = async (id) => {
  const user = await usersModel.findById(id).select("preferences");
  if (!user) {
    const error = new Error("user not found");
    error.status = 404;
    throw error;
  }

  return user.preferences;
};

const updateUserPreferences = async (id, preferences) => {
  const user = await usersModel
    .findByIdAndUpdate(id, { preferences }, { new: true, runValidators: true })
    .select("preferences");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return user.preferences;
};

module.exports = {
  signUpUser,
  loginUser,
  getUserPreferences,
  updateUserPreferences,
};
