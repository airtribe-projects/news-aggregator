// Error with an HTTP status, picked up by errorHandler
const createError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

module.exports = { createError };
