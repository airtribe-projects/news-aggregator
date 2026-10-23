require('dotenv').config();
const express = require('express');
const { connectToMongoDB } = require('./db');
const { startCacheRefresh } = require('./services/newsService');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();
const port = 3000;

connectToMongoDB();
startCacheRefresh();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/news', newsRoutes);

// Catches errors such as invalid JSON in the request body
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
});

app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});

module.exports = app;
