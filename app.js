const express = require('express');
const userRouter = require('./routes/user.routes');
const connectDB = require('./config/db');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRouter)


async function startServer() {
    try {
    await connectDB()

    console.log('db connected successfully')

    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
    } catch (err) {
        console.log('err',err)
    }
}

startServer()

module.exports = app;