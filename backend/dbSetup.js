const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  try {
    console.log('Checking database tables...');
    // We only want to create tables if they don't exist to prevent crashing on re-deploy
    const sql = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('organizer', 'judge', 'participant')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS submissions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          judge_id UUID REFERENCES users(id) ON DELETE SET NULL,
          project_url TEXT NOT NULL,
          description TEXT,
          score INTEGER CHECK (score >= 0 AND score <= 100),
          feedback TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          room VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO users (name, email, password_hash, role) 
      VALUES ('Super Admin', 'admin@gdg.com', '$2b$10$GXm6NGoaIsqbLzcrBooegufJkbrDf1LzntxLsEv.UPkrjCxA0EgJy', 'organizer')
      ON CONFLICT (email) DO NOTHING;
    `;
    await pool.query(sql);
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exit(1);
  }
}

seed();
