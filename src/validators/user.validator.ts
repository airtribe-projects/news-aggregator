import { createError } from '../utils/appError';
import { eHttpStatusCode } from '../enums/server.enums';
import { LoginInput, SignupInput } from '../interfaces/user.interface';
import {
    EMAIL_MAX,
    EMAIL_PATTERN,
    LOGIN_FIELDS,
    NAME_MAX,
    PASSWORD_MAX,
    PASSWORD_MIN,
    PREFERENCES_UPDATE_FIELDS,
    PREFERENCE_MAX_LENGTH,
    PREFERENCES_MAX_COUNT,
    SIGNUP_FIELDS,
} from '../consts/user.consts';

const requireString = (value: unknown, field: string): string => {
    if (typeof value !== 'string') {
        throw createError(eHttpStatusCode.BAD_REQUEST, `${field} is required and must be a string`);
    }
    return value;
};

const requireLength = (value: string, field: string, min: number, max: number): string => {
    if (value.length < min || value.length > max) {
        throw createError(eHttpStatusCode.BAD_REQUEST, `${field} must be between ${min} and ${max} characters`);
    }
    return value;
};

const requireObject = (body: unknown): Record<string, unknown> => {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        throw createError(eHttpStatusCode.BAD_REQUEST, 'Request body must be a JSON object');
    }
    return body as Record<string, unknown>;
};

export const validatePreferences = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        throw createError(eHttpStatusCode.BAD_REQUEST, 'preferences is required and must be an array of strings');
    }
    if (value.length > PREFERENCES_MAX_COUNT) {
        throw createError(eHttpStatusCode.BAD_REQUEST, `preferences can have at most ${PREFERENCES_MAX_COUNT} items`);
    }
    const cleaned = value.map((item) => {
        const text = requireString(item, 'each preference').trim().toLowerCase();
        return requireLength(text, 'each preference', 1, PREFERENCE_MAX_LENGTH);
    });
    return [...new Set(cleaned)];
};

export const validateSignup = (body: unknown): SignupInput => {
    const data = requireObject(body);

    const unknown = Object.keys(data).find((key) => !SIGNUP_FIELDS.includes(key));
    if (unknown) {
        throw createError(eHttpStatusCode.BAD_REQUEST, `Unknown field: ${unknown}`);
    }

    const name = requireLength(requireString(data.name, 'name').trim(), 'name', 1, NAME_MAX);

    const email = requireLength(requireString(data.email, 'email').trim().toLowerCase(), 'email', 1, EMAIL_MAX);
    if (!EMAIL_PATTERN.test(email)) {
        throw createError(eHttpStatusCode.BAD_REQUEST, 'email must be a valid email address');
    }

    const password = requireLength(requireString(data.password, 'password'), 'password', PASSWORD_MIN, PASSWORD_MAX);

    const preferences = data.preferences === undefined ? [] : validatePreferences(data.preferences);

    return { name, email, password, preferences };
};

export const validateLogin = (body: unknown): LoginInput => {
    const data = requireObject(body);

    const unknown = Object.keys(data).find((key) => !LOGIN_FIELDS.includes(key));
    if (unknown) {
        throw createError(eHttpStatusCode.BAD_REQUEST, `Unknown field: ${unknown}`);
    }

    const email = requireString(data.email, 'email').trim().toLowerCase();
    const password = requireString(data.password, 'password');

    return { email, password };
};

export const validatePreferencesUpdate = (body: unknown): string[] => {
    const data = requireObject(body);

    const unknown = Object.keys(data).find((key) => !PREFERENCES_UPDATE_FIELDS.includes(key));
    if (unknown) {
        throw createError(eHttpStatusCode.BAD_REQUEST, `Unknown field: ${unknown}`);
    }

    return validatePreferences(data.preferences);
};
