
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    source: {
        id: {
            type: String,
            default: null
        },
        name: {
            type: String,
            default: null
        }
    },
    author: {
        type: String,
        default: null
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    urlToImage: {
        type: String,
        default: null
    },
    publishedAt: {
        type: Date,
        default: null
    },
    content: {
        type: String,
        default: null
    },

    // Store user IDs rather than separate copies of the same article.
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    favoriteBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema);
