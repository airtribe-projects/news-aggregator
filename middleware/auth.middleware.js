const jwt = require("jsonwebtoken");
const { ErrorResponse } = require("../utils/response");

const isAuthorized = (req, res, next) => {
    // Check if the Authorization header is present
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json(
            ErrorResponse('No token provided')
        );
    }
    // Split the Authorization header into scheme and token
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json(
            ErrorResponse('Invalid Token')
        );
    }

    // Verify the JWT token using the secret key
    try {
        // If the token is valid, attach the decoded token to the request object and call next() to proceed to the next middleware or route handler
        req.decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // Proceed to the next middleware or route handler
        next();
    }
    // Handle any errors that occur during token verification
    catch (error) {
        return res.status(401).json(
            ErrorResponse('Invalid Token')
        );
    }
};

module.exports = {
    isAuthorized
};