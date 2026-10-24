const mongoose = require("mongoose");
const Config = require("./env");

console.log('Config', Config)

async function connectDB() {
  await mongoose.connect(Config.DB_URL)
}

module.exports = connectDB