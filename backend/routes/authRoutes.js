const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Example of a Protected Route (RBAC) - Only Organizers can hit this endpoint
router.get('/organizer-dashboard', verifyToken, requireRole(['organizer']), (req, res) => {
  res.json({ message: 'Welcome to the organizer dashboard!' });
});

module.exports = router;
