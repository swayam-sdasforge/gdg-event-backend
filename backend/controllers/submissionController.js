const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Participant: Submit a project
exports.createSubmission = async (req, res) => {
  try {
    const { project_url, description } = req.body;
    const participant_id = req.user.id; // Extracted from JWT token

    const newSubmission = await pool.query(
      'INSERT INTO submissions (participant_id, project_url, description) VALUES ($1, $2, $3) RETURNING *',
      [participant_id, project_url, description]
    );

    res.status(201).json({ message: 'Project submitted successfully', submission: newSubmission.rows[0] });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Judge: Score a submission
exports.scoreSubmission = async (req, res) => {
  try {
    const { submission_id } = req.params;
    const { score, feedback } = req.body;
    const judge_id = req.user.id; // Extracted from JWT token

    if (score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }

    const updatedSubmission = await pool.query(
      'UPDATE submissions SET score = $1, feedback = $2, judge_id = $3 WHERE id = $4 RETURNING *',
      [score, feedback, judge_id, submission_id]
    );

    if (updatedSubmission.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ message: 'Submission scored successfully', submission: updatedSubmission.rows[0] });
  } catch (error) {
    console.error('Scoring error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Organizer/Judge: View all submissions
exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await pool.query(`
      SELECT s.id, s.project_url, s.description, s.score, s.feedback, u.name AS participant_name
      FROM submissions s
      JOIN users u ON s.participant_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(submissions.rows);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
