
require('dotenv').config();

const express = require('express');

const userRoutes = require('./src/routes/userRoutes');
const newsRoutes = require('./src/routes/newsRoutes');

const { errorHandler } = require('./src/middleware/errorMiddleware');

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
// Assignment-required endpoints
app.use('/', userRoutes);

// Existing endpoints for backward compatibility
app.use('/users', userRoutes);

// News routes
app.use('/news', newsRoutes);

// Handle unknown routes
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
