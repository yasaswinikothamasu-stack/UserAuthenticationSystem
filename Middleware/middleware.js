const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => 
 {
  let token = req.cookies.jwt; // safe navigation
  console.log("Cookies:", req.cookies);
  console.log("Token from cookie:", token);
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

const authorizedRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: No user info found' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have access' });
        }
        next();
    };
};

module.exports = { authMiddleware, authorizedRoles };
