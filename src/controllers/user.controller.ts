import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import * as userStore from '../db/userStore';
import { eHttpStatusCode, eResponseStatus } from '../enums/server.enums';
import { User } from '../interfaces/user.interface';
import { createError } from '../utils/appError';
import { validateLogin, validatePreferencesUpdate, validateSignup } from '../validators/user.validator';

const SALT_ROUNDS = 10;

const toPublicUser = ({ id, name, email, preferences, createdAt }: User) => ({
    id,
    name,
    email,
    preferences,
    createdAt,
});

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, preferences } = validateSignup(req.body);

    if (userStore.findByEmail(email)) {
        throw createError(eHttpStatusCode.CONFLICT, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = userStore.createUser({ name, email, passwordHash, preferences });

    res.status(eHttpStatusCode.OK).json({ status: eResponseStatus.SUCCESS, user: toPublicUser(user) });
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = validateLogin(req.body);

    const user = userStore.findByEmail(email);
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !passwordMatches) {
        throw createError(eHttpStatusCode.UNAUTHORIZED, 'Invalid email or password');
    }

    const token = jwt.sign({}, env.jwtSecret, {
        subject: String(user.id),
        expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
    });

    res.status(eHttpStatusCode.OK).json({ status: eResponseStatus.SUCCESS, token });
};

export const getPreferences = (_req: Request, res: Response): void => {
    const user = userStore.findById(res.locals.userId);
    if (!user) {
        throw createError(eHttpStatusCode.UNAUTHORIZED, 'Invalid or expired token');
    }

    res.status(eHttpStatusCode.OK).json({ status: eResponseStatus.SUCCESS, preferences: user.preferences });
};

export const updatePreferences = (req: Request, res: Response): void => {
    const preferences = validatePreferencesUpdate(req.body);

    const user = userStore.updateUserPreferences(res.locals.userId, preferences);
    if (!user) {
        throw createError(eHttpStatusCode.UNAUTHORIZED, 'Invalid or expired token');
    }

    res.status(eHttpStatusCode.OK).json({ status: eResponseStatus.SUCCESS, preferences: user.preferences });
};
