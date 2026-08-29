# GDG VIT Chennai - Event Management Backend

## 📌 Overview
This repository contains the backend (and connected frontend) for the GDG VIT Chennai Event Management system. Built with scalability and reproducibility in mind, the entire application is containerized using Docker, demonstrating core DevOps principles.

### Key Features
*   **Role-Based Access Control (RBAC):** Distinct roles for Organizers, Judges, and Participants.
*   **Real-time Chat:** Powered by WebSockets (`Socket.io`).
*   **Core Judging Workflow:** Secure endpoints for submitting and scoring projects.
*   **DevOps Ready:** Fully containerized using a multi-stage Docker build for the frontend and `docker-compose` for local orchestration.

---

## 🏗 System Architecture & Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL 15 (Containerized)
*   **Real-time Engine:** Socket.io
*   **Frontend:** React.js (Vite) served via NGINX (Multi-stage Docker build)
*   **Authentication:** JWT (JSON Web Tokens)
*   **Orchestration:** Docker Compose

### Data Flow Diagram (Mental Map)
1.  **Client** requests `http://localhost` ➔ Hits the **NGINX Frontend Container**.
2.  **API Requests** ➔ Routed to `http://localhost:5000` ➔ Hits the **Node.js Backend Container**.
3.  **Backend** ➔ Queries data securely from the **PostgreSQL Container** (Internal network, unexposed to public).

---

## 🚀 How to Run (Reproducibility)

Because this project uses Docker, you do not need Node.js or Postgres installed on your machine. You only need Docker Desktop.

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-folder>
    ```

2.  **Start the entire ecosystem:**
    ```bash
    docker compose up --build
    ```

3.  **Access the applications:**
    *   Frontend: `http://localhost`
    *   Backend API: `http://localhost:5000`
    *   Database: `localhost:5432`

---

## 🔐 Security & Edge Cases Handled

*   **CSRF Protection:** By utilizing stateless JWTs sent via `Authorization` headers instead of relying on traditional session cookies, the system is inherently protected against traditional Cross-Site Request Forgery (CSRF).
*   **SQL Injection & XSS:** The backend uses parameterized queries (via `pg`) to prevent SQL injection, and inputs are sanitized.
*   **Infrastructure Security:** The PostgreSQL database is locked inside an isolated Docker network. It is not publicly exposed; only the Node backend can access it.
*   **Optimized Image Size:** The frontend is built using a Multi-stage Docker build, discarding the massive Node.js environment and serving only static files via a lightweight Nginx container (~20MB).

---

## 🗄 Database Schema (Proposed)
*   `Users` (id, name, email, password_hash, role)
*   `Events` (id, name, description, created_by)
*   `Submissions` (id, participant_id, judge_id, project_url, score, feedback)
*   `Messages` (id, sender_id, receiver_id, content, timestamp)

---
*Note: Developed for Task 3 (Freshers) - GDG VIT Chennai.*
