# GlobeTrotter Backend - Phase 1 Setup & Status

This directory contains the Node.js / Express / PostgreSQL backend for the GlobeTrotter travel planner app, implementing all authentication and profile endpoints required by the React frontend.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL running locally

### Installation
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install npm dependencies:
    ```bash
    npm install
    ```
3. Configure environment variables in `.env` (a preconfigured `.env` is already created with your PostgreSQL connection parameters):
    ```env
    PORT=5000
    DATABASE_URL=postgresql://postgres:1234@localhost:5432/globetrotter
    JWT_SECRET=globetrotter_dev_secret_key_2026_change_in_production
    JWT_EXPIRES_IN=7d
    CORS_ORIGIN=http://localhost:5173
    ```

### Run Migrations & Seed Data
Initialize the database and populate the demo accounts:
```bash
npm run db:migrate
npm run db:seed
```

### Start Development Server
```bash
npm run dev
```

---

## 🛠️ API Documentation (Phase 1)

### Health Check
*   `GET /health`
    *   Returns database connectivity status and uptime details.

### Authentication
*   `POST /api/auth/signup`
    *   Creates a new traveler profile.
*   `POST /api/auth/login`
    *   Validates credentials and returns JWT token + user details.

### User Profile (Requires `Authorization: Bearer <token>`)
*   `GET /api/users/me`
    *   Retrieves currently logged-in traveler profile information.
*   `PUT /api/users/me`
    *   Updates traveler details (name, phone, city, country, etc.).
*   `DELETE /api/users/me`
    *   Permanently deletes user profile.
