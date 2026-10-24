const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const isBlank = (value) =>
    value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

const isStringArray = (value) =>
    Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim() !== '');

// Returns an error message, or null if every field is a non-empty string
const checkRequiredStrings = (body, fields) => {
    const missing = fields.filter((field) => isBlank(body[field]));
    if (missing.length > 0) {
        return `Missing required fields: ${missing.join(', ')}`;
    }

    const notStrings = fields.filter((field) => typeof body[field] !== 'string');
    if (notStrings.length > 0) {
        return `These fields must be strings: ${notStrings.join(', ')}`;
    }
    return null;
};

const validateRegister = (req, res, next) => {
    // req.body is undefined in Express 5 when no body is sent
    const body = req.body || {};

    const error = checkRequiredStrings(body, ['name', 'email', 'password']);
    if (error) {
        return res.status(400).json({ message: error });
    }
    if (!EMAIL_REGEX.test(body.email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (body.password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }
    if (body.preferences !== undefined && !isStringArray(body.preferences)) {
        return res.status(400).json({ message: 'preferences must be an array of strings' });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const error = checkRequiredStrings(req.body || {}, ['email', 'password']);
    if (error) {
        return res.status(400).json({ message: error });
    }
    next();
};

const validatePreferences = (req, res, next) => {
    const { preferences } = req.body || {};

    if (preferences === undefined) {
        return res.status(400).json({ message: 'Missing required fields: preferences' });
    }
    if (!isStringArray(preferences)) {
        return res.status(400).json({ message: 'preferences must be an array of strings' });
    }
    next();
};

module.exports = { validateRegister, validateLogin, validatePreferences };
