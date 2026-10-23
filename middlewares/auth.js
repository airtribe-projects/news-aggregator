const jwt = require("jsonwebtoken");

const isUserAuthorised = (req, res, next) => {
  let token;
  let decoded;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded.id;
    next();
  } else {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { isUserAuthorised };
