# CampusEvents — College Event Booking System (MERN Stack)

A full-stack event booking web app built for a college setting: students browse and book
seats for workshops, fests, seminars, and matches; admins create and manage events and see
who has booked them.

**Stack:** MongoDB, Express.js, React (Vite), Node.js — with JWT authentication.

```
event-booking/
├── backend/     Express + MongoDB REST API
└── frontend/    React (Vite) single-page app
```

## Features

- Student accounts: register/login, browse events, filter by category and search, book
  seats, view and cancel "My bookings".
- Admin accounts: create/edit/delete events, view all bookings, dashboard with stats.
- Seat-limit enforcement (can't overbook an event, even under concurrent requests).
- JWT-based auth with role-based access control (student vs admin).
- Seed script that populates an admin account and sample events.
- Admin event poster uploads served by the backend.
- QR e-tickets, email notifications, category analytics, and event waitlists.

## 1. Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- A MongoDB database — either:
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (free tier, no local install, recommended), or
  - MongoDB installed locally

## 2. Run it locally

### Backend

```bash
cd backend
cp .env.example .env
# open .env and set MONGO_URI to your database connection string
# set JWT_SECRET to a long random value
npm install
npm run seed     # optional: creates demo admin/student accounts + sample events
npm run dev       # starts the API on http://localhost:5000
```

### Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
# .env already points to http://localhost:5000/api, which matches the backend above
npm install
npm run dev       # starts the app on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### Optional email notifications

Booking confirmations, cancellation messages, and waitlist availability notices are sent when
SMTP variables are configured. Copy the SMTP entries from `backend/.env.example` into
`backend/.env`. Mailtrap is convenient for testing; Gmail requires an App Password. Without
these variables, bookings still work and email delivery is skipped.

Event posters are uploaded from the admin event form as image files up to 5 MB and served from
`/uploads`. QR entry passes are generated when a booking is confirmed and can be viewed or
downloaded from **My bookings**. When an event is full, students can join its FIFO waitlist;
cancelling a booking notifies the first eligible waitlisted student.

### Seed account

The seed script creates a default admin account for local setup and testing. Students can register normally from the frontend and sign in without any demo credentials exposed in the app.

## 3. Deploying it so you can show the college authority

The simplest free path is: **MongoDB Atlas** (database) + **Render** (backend) +
**Vercel or Netlify** (frontend). All three have free tiers with no credit card commitment
for small projects.

### Step 1 — Database (MongoDB Atlas)

1. Create a free cluster at https://www.mongodb.com/cloud/atlas/register.
2. Under **Database Access**, create a database user with a password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — fine for a demo.
4. Click **Connect → Drivers**, copy the connection string, and replace `<password>` with
   your user's password. This is your `MONGO_URI`.

### Step 2 — Backend (Render)

1. Push this project to a GitHub repository.
2. Go to https://render.com → **New → Web Service** → connect your repo.
3. Set:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variables (from `backend/.env.example`):
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — you'll fill this in after deploying the frontend (Step 3)
   - `PORT` — Render sets this automatically; you can leave your own default
5. Deploy. Note the resulting URL, e.g. `https://campus-events-api.onrender.com`.
6. Once deployed, you can run the seed script from your own machine pointed at the Atlas
   URI (`MONGO_URI=<atlas uri> npm run seed` inside `backend/`) to populate demo data.

### Step 3 — Frontend (Vercel)

1. Go to https://vercel.com → **Add New → Project** → import the same repo.
2. Set:
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Add environment variable:
   - `VITE_API_URL` = `https://campus-events-api.onrender.com/api` (your Render URL + `/api`)
4. Deploy. Note the resulting URL, e.g. `https://campus-events.vercel.app`.

### Step 4 — Connect the two

Go back to Render → your backend service → environment variables → set `CLIENT_URL` to
your Vercel URL (e.g. `https://campus-events.vercel.app`), then redeploy the backend so
CORS allows requests from your live frontend.

You now have a live link you can share with the college authority.

## 4. Project structure reference

```
backend/
├── config/db.js              MongoDB connection
├── models/                   User, Event, Booking (Mongoose schemas)
├── middleware/auth.js        JWT verification + admin-only guard
├── controllers/               Route handler logic
├── routes/                    Express routers (auth, events, bookings)
├── seed.js                    Demo data seeder
└── server.js                  App entry point

frontend/
├── src/api/axios.js           Pre-configured API client (adds JWT header)
├── src/context/AuthContext.jsx  Login/register/logout state, persisted to localStorage
├── src/components/             Navbar, EventCard, PrivateRoute
└── src/pages/                  Home, Login, Register, EventDetails, MyBookings,
                                 AdminDashboard, AdminEventForm
```

## 5. API overview

| Method | Endpoint              | Access        | Description                     |
|--------|------------------------|---------------|----------------------------------|
| POST   | /api/auth/register     | Public        | Create an account                |
| POST   | /api/auth/login        | Public        | Log in, returns JWT              |
| GET    | /api/auth/me           | Private       | Get current user                 |
| GET    | /api/events            | Public        | List events (search/category/upcoming filters) |
| GET    | /api/events/:id        | Public        | Event details                    |
| POST   | /api/events            | Admin         | Create event                     |
| PUT    | /api/events/:id        | Admin         | Update event                     |
| DELETE | /api/events/:id        | Admin         | Delete event                     |
| POST   | /api/bookings          | Private       | Book seats for an event          |
| POST   | /api/bookings/waitlist | Private       | Join a full event's waitlist     |
| GET    | /api/bookings/mine     | Private       | Your bookings                    |
| DELETE | /api/bookings/:id      | Private       | Cancel your booking              |
| GET    | /api/bookings          | Admin         | All bookings (dashboard)         |

## 6. Notes for your presentation

- The seat-booking logic uses an atomic MongoDB update (`findOneAndUpdate` with a
  condition) so two students booking the last seat at the same time can't both succeed —
  a good point to highlight if asked about data integrity.
- Passwords are hashed with bcrypt before storage; they're never stored or returned in
  plain text.
- Auth uses JSON Web Tokens (JWT), stored in the browser and sent as a Bearer token on
  each request.
