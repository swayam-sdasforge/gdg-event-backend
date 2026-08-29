-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Handles RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('organizer', 'judge', 'participant')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Submissions Table (Core Judging Workflow)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    judge_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Null if not yet assigned to a judge
    project_url TEXT NOT NULL,
    description TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Messages Table (Real-time Chat History)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room VARCHAR(50) NOT NULL, -- e.g., 'global_chat' or 'help_room'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin (organizer) for testing purposes
-- Password is 'password123' (hashed via bcrypt)
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Super Admin', 'admin@gdg.com', '$2b$10$GXm6NGoaIsqbLzcrBooegufJkbrDf1LzntxLsEv.UPkrjCxA0EgJy', 'organizer');
