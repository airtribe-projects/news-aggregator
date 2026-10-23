const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {  
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    
    const part = authHeader.split(' ');

    if (part.length !== 2 || part[0] !== 'Bearer' || !part[1]) {
        return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    const token = part[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = authMiddleware;