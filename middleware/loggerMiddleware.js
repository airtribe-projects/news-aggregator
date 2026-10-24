const logger = (req, res, next) => {
    const start = Date.now();

    // 'finish' fires after the response is sent, so the status code is known
    res.on('finish', () => {
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
    });
    next();
};

module.exports = { logger };
