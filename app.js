require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const usersRoute = require("./routes/userRoutes")
const newsRoute = require("./routes/newsRoute")
const mongoose = require("mongoose");
const URI = process.env.MONGODB_URI;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", usersRoute);
app.use("/news", newsRoute);


mongoose.connect(URI).then(() => {
    console.log("Mongoose is connected!")
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });

}).catch((err) => {
    console.log("Mongoose is not connected!", err);
})


module.exports = app;