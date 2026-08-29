const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch(err => console.error('❌ Database connection error', err.stack));

// ==========================================
// REAL-TIME CHAT (Socket.io)
// ==========================================
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log(`🔌 New User connected: ${socket.id}`);
  
  // User joins a specific chat room (e.g., 'global_chat')
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Handle incoming messages
  socket.on('send_message', async (data) => {
    const { sender_id, room, content } = data;
    
    try {
      // 1. Save the message to the Postgres database so it persists
      const insertResult = await pool.query(
        'INSERT INTO messages (sender_id, room, content) VALUES ($1, $2, $3) RETURNING *',
        [sender_id, room, content]
      );
      
      // Fetch the sender's name and role for broadcasting
      const savedMessage = await pool.query(`
        SELECT m.*, u.name as sender_name, u.role as sender_role 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE m.id = $1
      `, [insertResult.rows[0].id]);

      // 2. Broadcast the message to everyone in that specific room
      io.to(room).emit('receive_message', savedMessage.rows[0]);
    } catch (error) {
      console.error('Message save error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ==========================================
// REST API ROUTES
// ==========================================
const authRoutes = require('./routes/authRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes); // Judging Workflow

// Fetch Chat History
app.get('/api/messages/:room', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.room = $1 
      ORDER BY m.created_at ASC
    `, [req.params.room]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Basic Route for Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
