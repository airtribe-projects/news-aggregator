const jwt = require('jsonwebtoken');

// Checks the "Authorization: Bearer <token>" header.
// If the token is valid, the user's email is saved on req.userEmail.
function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userEmail = decoded.email;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = auth;
