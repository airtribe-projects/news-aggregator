const buildResponse = (data = {}) => ({
    data,
});

const buildErrorResponse = (message) => ({
    error: { message },
});

// Response
const CreatedResponse = (data = {}) => buildResponse(data);

const DataResponse = (data = {}) => buildResponse(data);

const BadRequestErrorResponse = (message = 'Bad Request') => buildErrorResponse(message);

const ErrorResponse = (message = 'Internal Server Error') => buildErrorResponse(message);

module.exports = {
    CreatedResponse,
    DataResponse,
    BadRequestErrorResponse,
    ErrorResponse,
};
