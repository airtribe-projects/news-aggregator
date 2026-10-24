function validateUser(req, res, next) {
    const { name, email, password, preferences } = req.body ?? {};
    const errors = {};

    // Name validation
    if (typeof name !== 'string') {
        errors.name = 'Name must be a string';
    } else if (name.trim().length === 0) {
        errors.name = 'Name cannot be empty';
    } else if (name.trim().length < 2) {
        errors.name = 'Name must be alease 2 charecters';
    }

    // Email validation
    if (typeof email !== 'string') {
        errors.email = 'Email must be a string';
    } else {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            errors.email = 'Email cannot be empty';
        } else if (
            normalizedEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            errors.email = 'Please provide a valid email address';
        }
    }

    // Password validation
    if (typeof password !== 'string') {
        errors.password = 'Password must be a string';
    } else if (password.length === 0) {
        errors.password = 'Password cannot be empty';
    } else if (password.length < 8) {
        errors.password = 'Password must be atlease 8 chars';
    } else if (!/[a-z]/.test(password)) {
        errors.password = 'Password must contain a lowercase letter';
    } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Password must contain an uppercase letter';
    } else if (!/[0-9]/.test(password)) {
        errors.password = 'Password must contain a number';
    } else if (!/[^A-Za-z0-9]/.test(password)) {
        errors.password = 'Password must contain a special character';
    }

    // Optional preferences validation
    if (preferences !== undefined) {
        if (!Array.isArray(preferences)) {
            errors.preferences = 'Preferences must be an array';
        } else if (
            preferences.some(
                (item) => typeof item !== 'string' || item.trim() === ''
            )
        ) {
            errors.preferences = 'Each preference must be a non-empty string';
        } else if (preferences.some((item) => item.trim().length > 50)) {
            errors.preferences =
                'Each preference cannot exceed 50 characters';
        }
    }

    // Return validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    // Normalize validated values
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();

    if (preferences !== undefined) {
        req.body.preferences = preferences.map((item) => item.trim());
    }

    next();
}

module.exports = validateUser