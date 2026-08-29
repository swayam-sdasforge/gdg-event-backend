const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Participant Routes
// Only 'participant' role can submit projects
router.post('/', verifyToken, requireRole(['participant']), submissionController.createSubmission);

// Judge Routes
// Only 'judge' role can score projects
router.put('/:submission_id/score', verifyToken, requireRole(['judge']), submissionController.scoreSubmission);

// Organizer & Judge Routes
// Both 'organizer' and 'judge' can view all submissions
router.get('/', verifyToken, requireRole(['organizer', 'judge']), submissionController.getAllSubmissions);

module.exports = router;
