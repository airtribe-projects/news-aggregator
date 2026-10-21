import { ErrorRequestHandler } from 'express';
import { eHttpStatusCode, eResponseStatus } from '../enums/server.enums';
import { isHttpError } from '../utils/appError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (isHttpError(err)) {
        res.status(err.statusCode).json({ status: eResponseStatus.ERROR, error: err.message });
        return;
    }
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(eHttpStatusCode.BAD_REQUEST).json({ status: eResponseStatus.ERROR, error: 'Malformed JSON body' });
        return;
    }
    if (process.env.NODE_ENV !== 'test') {
        console.error(err);
    }
    res.status(eHttpStatusCode.INTERNAL_SERVER_ERROR).json({
        status: eResponseStatus.ERROR,
        error: 'Internal server error',
    });
};
