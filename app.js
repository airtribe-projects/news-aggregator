const express = require("express");
const { config } = require("dotenv");
config();
const { connectDB } = require("./utils/db");

const userRoutes = require("./routes/user.route");
const newsRoutes = require("./routes/news.route");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/news", newsRoutes);

connectDB()
  .then(() => {
    app.listen(process.env.PORT, (err) => {
      if (err) {
        return console.log("Something bad happened", err);
      }
      console.log(`Server is listening on ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error(error);

    process.exit(1);
  });

module.exports = app;
