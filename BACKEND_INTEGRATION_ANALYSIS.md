# GlobeTrotter Frontend-Backend Integration Analysis

## A. Frontend Overview
*   **Main Frontend Framework**: React.js (built with Vite and TypeScript)
*   **Routing Approach**: `react-router-dom` (Version 7) with dynamic paths and standard protected routes
*   **State Management**: Zustand (`authStore` for user session, `tripBuilderStore` for active trip building state)
*   **API Client**: Axios with a centralized client (`axiosClient.js`) that automatically intercepts:
    *   Requests: Attaches JWT from `localStorage` under `Authorization: Bearer <token>`
    *   Responses: Decodes response data (`response.data`) and handles `401 Unauthorized` errors globally by cleaning storage and redirecting to `/login`.
*   **Authentication & Token Storage**: Store JWT token locally in `localStorage` under key `gt_token`. User metadata is stored under `gt_user`.
*   **Environment Variable**: Uses `import.meta.env.VITE_API_BASE_URL` with a fallback to `http://localhost:5000/api`.

---

## B. Frontend Screens & API Map

| Screen/Page | Route | Backend Required? | Data Required | Existing API Call / Endpoint Expected | Notes |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **Login** | `/login` | Yes | Credentials (`email`, `password`) | `POST /auth/login` | Expects token & user fields in `{ data: { user, token } }` |
| **Register** | `/register` | Yes | Profile Details | `POST /auth/signup` | Form submits first name, last name, email, password, etc. |
| **Dashboard** | `/dashboard` | Yes | Recent trips, overall stats | `GET /dashboard` & `GET /trips` | Aggregates completed, upcoming, ongoing trips |
| **My Trips** | `/trips` | Yes | List of user's trips | `GET /trips` & `DELETE /trips/:id` | Filterable by status (ongoing, upcoming, completed) |
| **Create Trip** | `/trips/new` | Yes | New trip metadata | `POST /trips` | Redirects to builder upon success |
| **Itinerary Builder** | `/trips/:tripId/build` | Yes | Trip info, stops, search results | `GET /trips/:id`, `GET /trips/:id/stops`, `POST /trips/:id/stops` | Uses Drag-and-Drop to reorder stops and activities |
| **Itinerary View** | `/trips/:tripId/itinerary`| Yes | Final days, activities, budget | `GET /trips/:id/itinerary`, `GET /trips/:id/budget` | Shows interactive budget charts (Recharts) |
| **Calendar** | `/trips/:tripId/calendar` | Yes | Trip days & active events | `GET /trips/:id/calendar` | Displays day-by-day grid |
| **Explore Cities** | `/search/cities` | Yes | Query parameters, list of cities | `GET /cities` | Supports searching, sorting, and regional filters |
| **Explore Activities**| `/search/activities` | Yes | Activities inside a city | `GET /activities` | Search with rating, category, and duration filters |
| **My Profile** | `/profile` | Yes | Current user metadata | `GET /users/me`, `PUT /users/me`, `DELETE /users/me` | Allows fields updating and account deletion |
| **Community** | `/community` | Yes | Public trips shared by users | `GET /trips?public=true` | Searchable list of shared travel itineraries |
| **Public View** | `/public/trips/:token` | Yes | Shared trip detail | `GET /public/trips/:token`, `POST /public/trips/:token/copy` | Accessible without logging in; copy clones trip |
| **Admin Panel** | `/admin` | Yes | Platform analytics, users list | `GET /admin/analytics`, `GET /admin/users` | Protected; requires verified `ADMIN` role |

---

## C. API Contracts for Phase 1 Endpoints

### 1. `POST /api/auth/signup`
*   **Used By**: `RegisterPage.jsx`
*   **Request Body**:
    ```json
    {
      "firstName": "string (required)",
      "lastName": "string (required)",
      "email": "string (required, email)",
      "password": "string (required, min 6)",
      "phone": "string (optional)",
      "city": "string (optional)",
      "country": "string (optional)",
      "additionalInfo": "string (optional)"
    }
    ```
*   **Expected Response**:
    ```json
    {
      "message": "Account created successfully"
    }
    ```
*   **Authentication**: None.

### 2. `POST /api/auth/login`
*   **Used By**: `LoginPage.jsx`
*   **Request Body**:
    ```json
    {
      "email": "string (required, email)",
      "password": "string (required)"
    }
    ```
*   **Expected Response**:
    ```json
    {
      "data": {
        "token": "JWT_TOKEN_STRING",
        "user": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "role": "USER",
          "photo": "string or null",
          "phone": "string",
          "city": "string",
          "country": "string"
        }
      }
    }
    ```
*   **Authentication**: None.

### 3. `GET /api/users/me`
*   **Used By**: `ProfilePage.jsx`
*   **Headers**: `Authorization: Bearer <token>`
*   **Expected Response**:
    ```json
    {
      "data": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "USER",
        "photo": "string or null",
        "phone": "string",
        "city": "string",
        "country": "string"
      }
    }
    ```

### 4. `PUT /api/users/me`
*   **Used By**: `ProfilePage.jsx`
*   **Headers**: `Authorization: Bearer <token>`
*   **Request Body**:
    ```json
    {
      "firstName": "string (optional)",
      "lastName": "string (optional)",
      "email": "string (optional, email)",
      "phone": "string (optional)",
      "city": "string (optional)",
      "country": "string (optional)"
    }
    ```
*   **Expected Response**:
    ```json
    {
      "data": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "USER",
        "photo": "string or null",
        "phone": "string",
        "city": "string",
        "country": "string"
      }
    }
    ```

### 5. `DELETE /api/users/me`
*   **Used By**: `ProfilePage.jsx`
*   **Headers**: `Authorization: Bearer <token>`
*   **Expected Response**:
    ```json
    {
      "message": "Account deleted successfully"
    }
    ```

---

## D. Backend Implementation Phases

### **PHASE 1 (CURRENT - COMPLETED & READY)**
*   Express & Node server configurations (CORS, Error handlers, Zod validation).
*   PostgreSQL database migration & seed setup (users table, seed travelers).
*   JWT-based session authentication with password security using bcrypt.
*   Profile management endpoints (`/me` actions for user profiles).
*   API integration verification.

### **PHASE 2 (DEFERRED)**
*   Trips management (`POST /trips`, `GET /trips`, `PUT /trips/:id`, `DELETE /trips/:id`).
*   Dashboard aggregations (`GET /dashboard`).
*   City exploration (`GET /cities`, `GET /cities/:id`).
*   Trip Stops / Sections builder APIs (`GET /trips/:id/stops`, `POST /trips/:id/stops`, `PUT /stops/:id`, `DELETE /stops/:id`, `PATCH /trips/:id/stops/reorder`).

### **PHASE 3 (DEFERRED)**
*   Stops-activities connections (`POST /stops/:id/activities`, `DELETE /trip-activities/:id`, `PATCH /stops/:id/activities/reorder`).
*   Budget/Expense calculation engine (`GET /trips/:id/budget`).
*   Timeline/Calendar views (`GET /trips/:id/calendar`, `GET /trips/:id/itinerary`).
*   Public Trip Sharing APIs (`POST /trips/:id/share`, `GET /public/trips/:token`, `POST /public/trips/:token/copy`).

### **PHASE 4 (DEFERRED)**
*   Admin dashboard analytics (`GET /admin/analytics`, `GET /admin/users`, `GET /admin/trips`).
*   Production configuration, security audit, and deployment pipelines.
