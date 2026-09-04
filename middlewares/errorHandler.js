const notFoundHandler = (req, res, next) => {
    next({ status: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Malformed JSON in request body' });
    }

    const status = err.status || 500;

    if (status === 500) {
        console.error(err);
    }

    const response = {
        error: status === 500 ? 'Internal server error' : err.message,
    };

    if (err.details) {
        response.details = err.details;
    }

    return res.status(status).json(response);
};

module.exports = { notFoundHandler, errorHandler };
