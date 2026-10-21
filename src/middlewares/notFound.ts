import { RequestHandler } from 'express';
import { eHttpStatusCode } from '../enums/server.enums';
import { createError } from '../utils/appError';

export const notFound: RequestHandler = (req, _res, next) => {
    next(createError(eHttpStatusCode.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found`));
};
