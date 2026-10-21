const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Mongo DB connected successfully");
  } catch (err) {
    console.log("MongoDB connection failed:", err.message);
    throw err;
  }
};

module.exports = connectDB;
