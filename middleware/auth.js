const jwt = require('jsonwebtoken')

module.exports.verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) {
        return res.status(401).json({ message: "token missing !" })
    }

    const token = header.startsWith('Bearer') ? header.split(' ')[1] : header

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        next();

    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token!' });
    }

}