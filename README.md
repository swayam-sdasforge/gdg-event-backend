# GDG VIT Chennai - Event Management Backend

## Overview
This repository contains the backend (and connected frontend) for the GDG VIT Chennai Event Management system. Built with scalability and reproducibility in mind, the entire application is containerized using Docker, demonstrating core DevOps principles.

### Key Features
*   **Role-Based Access Control (RBAC):** Distinct roles for Organizers, Judges, and Participants.
*   **Real-time Chat:** Powered by WebSockets (`Socket.io`).
*   **Core Judging Workflow:** Secure endpoints for submitting and scoring projects.
*   **DevOps Ready:** Fully containerized using a multi-stage Docker build for the frontend and `docker-compose` for local orchestration.

---

## System Architecture & Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL 15 (Containerized)
*   **Real-time Engine:** Socket.io
*   **Frontend:** React.js (Vite) served via NGINX (Multi-stage Docker build)
*   **Authentication:** JWT (JSON Web Tokens)
*   **Orchestration:** Docker Compose

### Data Flow Diagram (Mental Map)
1.  **Client** requests `http://localhost` -> Hits the **NGINX Frontend Container**.
2.  **API Requests** -> Routed to `http://localhost:5000` -> Hits the **Node.js Backend Container**.
3.  **Backend** -> Queries data securely from the **PostgreSQL Container** (Internal network, unexposed to public).

---

## DevOps & Cloud Native Architecture

This project was engineered with a strict focus on DevOps best practices, ensuring true reproducibility, scalability, and security.

### 1. Infrastructure as Code & Orchestration
*   **Docker Compose:** The entire ecosystem (Database, API, Frontend) is orchestrated declaratively. A single `docker compose up` command spins up the entire environment, completely eliminating the "It works on my machine" problem.
*   **Health Checks:** The `docker-compose.yml` implements container health checks (`pg_isready`). The backend container is configured to wait until PostgreSQL is fully healthy before starting, preventing deployment race conditions.

### 2. Multi-Stage Builds & Image Optimization
*   The frontend uses a **Multi-Stage Dockerfile**. 
*   **Stage 1:** Uses a heavy Node.js image to compile the React/Vite source code.
*   **Stage 2:** Discards the Node.js environment entirely and copies only the static compiled assets into a lightweight **NGINX Alpine** container.
*   **Impact:** This reduces the final container image size by over 90% and massively reduces the attack surface since the Node toolchain is removed from production.

### 3. Zero-Touch Database Provisioning
*   No manual database setup is required. The `init.sql` schema is mapped directly to the PostgreSQL container's `/docker-entrypoint-initdb.d/` directory via Docker volumes. 
*   Upon the very first boot, PostgreSQL automatically provisions its own tables, constraints, and initial admin user.

### 4. Network Isolation & Statefulness
*   **Persistent Volumes:** Database data is persisted using Docker volumes (`pgdata`), ensuring stateful data survives container restarts while the application itself remains stateless.
*   **Internal Bridge Network:** The PostgreSQL database does not expose its port to the public internet. It exists on a private internal Docker network, accessible only by the Node.js backend container.

---

## How to Run (Reproducibility)

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

---

## Security & Edge Cases Handled

*   **CSRF Protection:** By utilizing stateless JWTs sent via `Authorization` headers instead of relying on traditional session cookies, the system is inherently protected against traditional Cross-Site Request Forgery (CSRF).
*   **SQL Injection & XSS:** The backend uses parameterized queries (via `pg`) to prevent SQL injection, and inputs are sanitized.
*   **RBAC Database Constraints:** Security is enforced not just at the API layer, but at the database level. `CHECK` constraints prevent invalid roles and out-of-bounds judging scores (0-100) from ever being committed.

---

## Database Schema
*   `Users` (id, name, email, password_hash, role)
*   `Submissions` (id, participant_id, judge_id, project_url, score, feedback)
*   `Messages` (id, sender_id, room, content, timestamp)

---
*Note: Developed for Task 3 (Freshers) - GDG VIT Chennai.*
