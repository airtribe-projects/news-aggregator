const mongoose = require('mongoose');

const articleSnapshotSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: String,
    description: String,
    url: String,
    source: String,
    publishedAt: String
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    preferences: { type: [String], default: [] },
    readArticles: { type: [articleSnapshotSchema], default: [] },
    favoriteArticles: { type: [articleSnapshotSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
