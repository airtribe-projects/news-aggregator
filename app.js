const express = require("express");
const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User routes
const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

// News routes — register only once
const newsRoutes = require("./routes/newsRoutes");
app.use("/news", newsRoutes);

// Start server
app.listen(port, (err) => {
  if (err) {
    return console.log("Something bad happened", err);
  }

  console.log(`Server is listening on ${port}`);
});

module.exports = app;
