const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to check if the user has a valid JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(403).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Expected format: "Bearer <token>"
    const bearerToken = token.split(' ')[1];
    const verified = jwt.verify(bearerToken, process.env.JWT_SECRET);
    
    req.user = verified; // Add the decoded token payload (id, role) to the request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Factory Middleware for Role-Based Access Control (RBAC)
exports.requireRole = (rolesArray) => {
  return (req, res, next) => {
    if (!req.user || !rolesArray.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient privileges.' });
    }
    next();
  };
};
