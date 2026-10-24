const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const MAX_NAME_LENGTH = 100;
const MAX_PREFERENCES = 20;
const MAX_PREFERENCE_LENGTH = 50;

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}

function isValidEmail(value) {
    return isNonEmptyString(value) && EMAIL_PATTERN.test(value.trim());
}

function isValidPassword(value) {
    return typeof value === 'string'
        && value.length >= MIN_PASSWORD_LENGTH
        && value.length <= MAX_PASSWORD_LENGTH;
}

function isValidName(value) {
    return isNonEmptyString(value) && value.trim().length <= MAX_NAME_LENGTH;
}

function normalizePreferences(preferences) {
    if (preferences === undefined) {
        return [];
    }

    if (!Array.isArray(preferences) || preferences.length > MAX_PREFERENCES) {
        return null;
    }

    const normalized = [];
    for (const item of preferences) {
        if (!isNonEmptyString(item) || item.trim().length > MAX_PREFERENCE_LENGTH) {
            return null;
        }
        normalized.push(item.trim());
    }

    return normalized;
}

module.exports = {
    isPlainObject,
    isNonEmptyString,
    isValidEmail,
    isValidPassword,
    isValidName,
    normalizePreferences
};
