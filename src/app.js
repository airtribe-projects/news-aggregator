
const express = require("express");
require("dotenv").config();

const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const newsRoutes = require("./routes/newsRoutes");

const app = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/news", newsRoutes);

if (require.main === module) {
    connectDB()
        .then(() => {
            console.log("Database connection is successful");

            app.listen(3000, () => {
                console.log("Server is running on port 3000");
            });
        })
        .catch((error) => {
            console.error("Database connection failed:", error.message);
            process.exitCode = 1;
        });
}

module.exports = app;
