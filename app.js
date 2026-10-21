require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const usersRoute = require("./routes/userRoutes");
const newsRoute = require("./routes/newsRoute");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello Users!");
});

app.use("/users", usersRoute);
app.use("/news", newsRoute);

// Connect to MongoDB when the app is imported or run directly.
const dbConnection = connectDB();

if (require.main === module) {
  dbConnection
    .then(() => {
      app.listen(port, () => {
        console.log(`Server is listening on ${port}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      process.exit(1);
    });
}

module.exports = app;
