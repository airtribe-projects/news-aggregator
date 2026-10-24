const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/news_app';

async function connectDb({ isServer } = {}) {
    const uri = process.env.MONGODB_URI || DEFAULT_URI;

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');

        if (!isServer) {
            const User = require('../models/user');
            await User.deleteMany({});
        }
    } catch (err) {
        console.error('MongoDB connection failed', err.message);
        if (isServer) {
            process.exit(1);
        }
        throw err;
    }
}

module.exports = {
    connectDb
};
