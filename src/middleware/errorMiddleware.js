
const errorHandler = (err, req, res, next) => {
    const statusCode =
        Number.isInteger(err.statusCode) &&
        err.statusCode >= 400 &&
        err.statusCode <= 599
            ? err.statusCode
            : 500;

    // Log unexpected server errors
    if (statusCode >= 500) {
        console.error('Server Error:', err);
    }

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? 'Internal server error'
                : err.message
    });
};

module.exports = {
    errorHandler
};
