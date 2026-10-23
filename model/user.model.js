const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: 'String',
        required: true,
        trim: true,
    },
    email: {
        type: 'String',
        required: true,
        trim: true,
        unique: true,
        match: [
            /^[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?\.)+[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?$/i,
            'Please provide a valid email address'
        ],
    },
    password: {
        type: 'String',
        required: true,
        validate: {
            validator: (password) => typeof password === 'string' && (
                /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(password) ||
                (password.length >= 3 && password.length <= 16)
            ),
            message: 'Password must be between 3 and 16 characters long'
        }
    },
    preferences: {
        type: ['String'],
        default: []
    }
});

module.exports = mongoose.model("User", userSchema);