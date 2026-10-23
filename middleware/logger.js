const logger = (req, res, next) => {
    console.log(`${req.method}: ${req.url} received at ${new Date().toISOString()}`);
    next();
}

module.exports = { logger };