import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import * as userStore from '../db/userStore';
import { eHttpStatusCode } from '../enums/server.enums';
import { createError } from '../utils/appError';

const BEARER_PREFIX = 'Bearer ';

export const authenticate: RequestHandler = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith(BEARER_PREFIX)) {
        throw createError(eHttpStatusCode.UNAUTHORIZED, 'Missing or malformed Authorization header');
    }

    let userId: number;
    try {
        const payload = jwt.verify(header.slice(BEARER_PREFIX.length).trim(), env.jwtSecret);
        userId = Number(typeof payload === 'string' ? payload : payload.sub);
    } catch {
        throw createError(eHttpStatusCode.UNAUTHORIZED, 'Invalid or expired token');
    }

    if (!userStore.findById(userId)) {
        throw createError(eHttpStatusCode.UNAUTHORIZED, 'Invalid or expired token');
    }

    res.locals.userId = userId;
    next();
};
