
const validateSignup = (req, res, next) => {
    const { name, email, password, preferences } = req.body || {};

    if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
            message: 'Name is required'
        });
    }

    if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({
            message: 'Email is required'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            message: 'Invalid email format'
        });
    }

    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long'
        });
    }

    if (
        preferences !== undefined &&
        (!Array.isArray(preferences) ||
            !preferences.every(
                (item) => typeof item === 'string' && item.trim().length > 0
            ))
    ) {
        return res.status(400).json({
            message: 'Preferences must be an array of non-empty strings'
        });
    }

    next();
};


const validateLogin = (req, res, next) => {
    const { email, password } = req.body || {};

    // Validate email
    if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({
            message: 'Email is required'
        });
    }

    // Validate password
    if (typeof password !== 'string' || !password) {
        return res.status(400).json({
            message: 'Password is required'
        });
    }

    next();
};

const validatePreferences = (req, res, next) => {
    const { preferences } = req.body || {};

    if (
        !Array.isArray(preferences) ||
        preferences.some(
            (item) =>
                typeof item !== 'string' ||
                !item.trim()
        )
    ) {
        return res.status(400).json({
            message: 'Preferences must be an array of non-empty strings'
        });
    }

    next();
};


module.exports = {
    validateSignup,
    validateLogin,
    validatePreferences
};
