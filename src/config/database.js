const mongoose = require("mongoose");
require("dotenv").config();

const id = process.env.MONGO_ID;
const pass = process.env.MONGO_PASS;

const connectDB = async () => {
  await mongoose.connect(
    `mongodb+srv://${id}:${pass}@cluster0.hbxy7dt.mongodb.net/news-aggregator`,
  );
};

module.exports = connectDB;
