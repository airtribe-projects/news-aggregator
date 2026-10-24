const notFound = (req, res, next) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
};

const errorHandler = (err, req, res, next) => {
    // Thrown by express.json() when the body isn't valid JSON
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Request body is not valid JSON' });
    }

    const status = err.status || 500;

    if (status === 500) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
    res.status(status).json({ message: err.message });
};

module.exports = { notFound, errorHandler };
