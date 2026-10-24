const jwt = require('jsonwebtoken');
const { findUserByEmail } = require('../controllers/users');

const JWT_SECRET = process.env.JWT_SECRET || 'news-aggregator-secret';

async function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = header.slice(7).trim();
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = typeof payload.email === 'string' ? await findUserByEmail(payload.email) : null;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = authenticate;
