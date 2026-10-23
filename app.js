// app.js
// Load environment variables from .env file
const { config } = require('dotenv');
config();

const express = require('express');

const { logger } = require('./middleware/logger');
const { userRoutes } = require('./routes/user.routes');
const { newsRoutes } = require('./routes/news.routes');

const app = express();

// middleware
app.use(logger);    // logger middleware
app.use(express.json());    // parse application/json
app.use(express.urlencoded({ extended: true }));    // parse application/x-www-form-urlencoded


// routes
app.use('/users', userRoutes);   // user routes
app.use('/news', newsRoutes);     // news routes
app.get('/', (req, res) => {    // health check route
    res.status(200).json({
        status: 'Ok',
        message: 'Server is working'
    });
});

module.exports = app;