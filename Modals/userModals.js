const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: "String",
        required: true,
        trim: true
    },
    email: {
        type: "String",
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: "String",
        required: true,
    },
    role: {
        type: "String",
        required: true,
        default: "user"
    },
    preference: {
        query: { type: String, default: "top news" },
        lang: { type: String, default: "en" },
        country: { type: String, default: "in" },
        max: { type: Number, default: 100 }
    }
})

module.exports = mongoose.model('User', userSchema);