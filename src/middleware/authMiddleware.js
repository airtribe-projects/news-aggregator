
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    try {
        // Read Authorization header
        const authHeader = req.headers.authorization;

        // Check Bearer token format
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication token is required'
            });
        }

        // Extract JWT token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Authentication token is required'
            });
        }

        // Verify JWT signature and expiry
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Validate userId from verified JWT payload
        if (
            !decoded ||
            typeof decoded.userId !== 'string' ||
            !decoded.userId.trim()
        ) {
            return res.status(401).json({
                message: 'Invalid authentication token'
            });
        }

        // Attach authenticated user ID to request
        req.user = {
            id: decoded.userId
        };

        // Continue to protected route
        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};

module.exports = {
    authenticateUser
};
