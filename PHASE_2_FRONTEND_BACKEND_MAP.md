# GlobeTrotter Phase 2 Frontend-Backend Integration Map

## 1. Overview
This document outlines the exact contracts between the React frontend and Express.js / Supabase PostgreSQL backend for **Phase 2 (Core Travel Planning)**.

---

## 2. API Contract Matrix

| Frontend Page / Component | Action | Method | Endpoint | Auth | Request Body / Query | Response Structure |
| :--- | :--- | :---: | :--- | :---: | :--- | :--- |
| **DashboardPage** | Load Dashboard | `GET` | `/api/dashboard` | Bearer JWT | None | `{ data: { stats: { total, upcoming, ongoing, completed }, recentTrips: [...], popularCities: [...] } }` |
| **DashboardPage / MyTripsPage** | List User Trips | `GET` | `/api/trips` | Bearer JWT | None | `{ data: [{ id, name, description, startDate, endDate, coverImage, budget, destinations, stopCount }, ...] }` |
| **CreateTripPage** | Create Trip | `POST` | `/api/trips` | Bearer JWT | `{ name, description?, startDate, endDate, coverImage?, budget? }` | `{ data: { id, name, ... } }` (HTTP 201) |
| **ItineraryBuilderPage / View** | Get Trip Details | `GET` | `/api/trips/:tripId` | Bearer JWT | None | `{ data: { id, name, description, startDate, endDate, coverImage, budget, isPublic, ... } }` |
| **ItineraryBuilderPage** | Update Trip | `PUT` | `/api/trips/:tripId` | Bearer JWT | `{ name?, description?, startDate?, endDate?, coverImage?, budget?, isPublic? }` | `{ data: { id, name, ... } }` |
| **MyTripsPage** | Delete Trip | `DELETE` | `/api/trips/:tripId` | Bearer JWT | None | `{ message: "Trip deleted successfully" }` |
| **CitySearchPage / Builder** | Search & Filter Cities | `GET` | `/api/cities` | Bearer JWT | `?search=&region=&sort=&limit=` | `{ data: [{ id, name, country, region, description, image, costIndex, popularity, latitude, longitude }, ...] }` |
| **CitySearchPage** | Get City Details | `GET` | `/api/cities/:cityId` | Bearer JWT | None | `{ data: { id, name, country, ... } }` |
| **ItineraryBuilderPage** | Get Stops for Trip | `GET` | `/api/trips/:tripId/stops` | Bearer JWT | None | `{ data: [{ id, tripId, cityId, cityName, startDate, endDate, budget, notes, order, city: {...} }, ...] }` |
| **ItineraryBuilderPage** | Add Stop | `POST` | `/api/trips/:tripId/stops` | Bearer JWT | `{ cityId?, cityName?, startDate?, endDate?, budget?, notes?, order? }` | `{ data: { id, tripId, cityId, cityName, startDate, endDate, budget, notes, order, ... } }` (HTTP 201) |
| **ItineraryBuilderPage** | Update Stop | `PUT` | `/api/stops/:stopId` | Bearer JWT | `{ cityId?, cityName?, startDate?, endDate?, budget?, notes? }` | `{ data: { id, cityId, cityName, ... } }` |
| **ItineraryBuilderPage** | Delete Stop | `DELETE` | `/api/stops/:stopId` | Bearer JWT | None | `{ message: "Stop deleted successfully" }` |
| **ItineraryBuilderPage** | Reorder Stops (DnD) | `PATCH` | `/api/trips/:tripId/stops/reorder` | Bearer JWT | `{ stops: [{ id: 1, order: 0 }, { id: 2, order: 1 }] }` | `{ data: [{ id, order, ... }, ...] }` |
| **ItineraryViewPage** | Get Complete Itinerary | `GET` | `/api/trips/:tripId/itinerary` | Bearer JWT | None | `{ data: { trip: {...}, days: [{ dayNumber, date, city, stopId, activities, totalCost }], stops: [...] } }` |

---

## 3. Database Schema (PostgreSQL / Supabase)

### `users` Table
- `id` (SERIAL PRIMARY KEY)
- `first_name`, `last_name`, `email` (UNIQUE), `password_hash`, `phone`, `city`, `country`, `photo`, `additional_info`, `role` (`USER` / `ADMIN`), `created_at`, `updated_at`

### `cities` Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR 200), `country` (VARCHAR 200), `region` (VARCHAR 100), `description` (TEXT), `image` (TEXT), `cost_index` (NUMERIC 3,1), `popularity` (NUMERIC 3,1), `latitude` (NUMERIC 10,6), `longitude` (NUMERIC 10,6), `created_at` (TIMESTAMPTZ)

### `trips` Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id) ON DELETE CASCADE)
- `name` (VARCHAR 300), `description` (TEXT), `start_date` (DATE), `end_date` (DATE), `cover_image` (TEXT), `budget` (NUMERIC 12,2), `is_public` (BOOLEAN DEFAULT false), `share_token` (VARCHAR 64 UNIQUE), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)

### `trip_stops` Table
- `id` (SERIAL PRIMARY KEY)
- `trip_id` (INTEGER REFERENCES trips(id) ON DELETE CASCADE)
- `city_id` (INTEGER REFERENCES cities(id) ON DELETE SET NULL)
- `city_name` (VARCHAR 200), `start_date` (DATE), `end_date` (DATE), `budget` (NUMERIC 12,2), `notes` (TEXT), `stop_order` (INTEGER DEFAULT 0), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ)

---

## 4. Security & Ownership Rules
- All Phase 2 routes (Trips, Stops, Cities, Dashboard) require JWT authentication (`Authorization: Bearer <token>`).
- User ID is strictly extracted from the decoded JWT payload (`req.user.id`).
- Private trips and stops cannot be read, modified, deleted, or reordered by any user other than the owner (`403 Forbidden`).
- Stop reordering operations use PostgreSQL transactions (`BEGIN` / `COMMIT` / `ROLLBACK`) to ensure data consistency.
- Deleting a trip cascades to all associated trip stops automatically.
