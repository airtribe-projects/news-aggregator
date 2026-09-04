const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const validatePreferences = (preferences, errors) => {
    if (!Array.isArray(preferences)) {
        errors.push('preferences must be an array of strings');
        return;
    }
    if (!preferences.every(isNonEmptyString)) {
        errors.push('preferences must contain only non-empty strings');
    }
};

const validateSignup = (req, res, next) => {
    const { name, email, password, preferences } = req.body || {};
    const errors = [];

    if (!isNonEmptyString(name)) {
        errors.push('name is required and must be a non-empty string');
    }

    if (!isNonEmptyString(email)) {
        errors.push('email is required and must be a non-empty string');
    } else if (!EMAIL_PATTERN.test(email.trim())) {
        errors.push('email must be a valid email address');
    }

    if (!isNonEmptyString(password)) {
        errors.push('password is required and must be a non-empty string');
    } else if (password.length < MIN_PASSWORD_LENGTH) {
        errors.push(`password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }

    if (preferences !== undefined) {
        validatePreferences(preferences, errors);
    }

    if (errors.length > 0) {
        return next({ status: 400, message: 'Invalid signup payload', details: errors });
    }

    return next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body || {};
    const errors = [];

    if (!isNonEmptyString(email)) {
        errors.push('email is required');
    }

    if (!isNonEmptyString(password)) {
        errors.push('password is required');
    }

    if (errors.length > 0) {
        return next({ status: 400, message: 'Invalid login payload', details: errors });
    }

    return next();
};

module.exports = { validateSignup, validateLogin, validatePreferences, isNonEmptyString };

const validatePreferencesBody = (req, res, next) => {
    const { preferences } = req.body || {};
    const errors = [];

    if (preferences === undefined) {
        errors.push('preferences is required');
    } else {
        validatePreferences(preferences, errors);
    }

    if (errors.length > 0) {
        return next({ status: 400, message: 'Invalid preferences payload', details: errors });
    }

    return next();
};

module.exports.validatePreferencesBody = validatePreferencesBody;
