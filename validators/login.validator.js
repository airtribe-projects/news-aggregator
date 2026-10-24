function validateLogin(req, res, next) {
    const { email, password } = req.body ?? {};
    const errors = {};

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

        // Return validation errors
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    req.body.email = email.trim().toLowerCase();
    req.body.password = password.trim();

    next();
}


module.exports = validateLogin