# 🚀 Placement Journey

A full-stack placement-prep web application with study articles, a timed MCQ quiz engine, a topic-browser sidebar, and an admin dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| HTTP Client | Axios |

---

## Project Structure

```
placement_Journey/
├── backend/          # Express REST API
│   ├── middleware/
│   │   └── isAdmin.js        # Admin token middleware
│   ├── models/
│   │   ├── Article.js        # Mongoose Article schema
│   │   └── Quiz.js           # Mongoose Quiz schema
│   ├── routes/
│   │   ├── articles.js       # CRUD for articles
│   │   └── quiz.js           # Quiz questions + seed
│   ├── server.js
│   └── .env.example
└── frontend/         # React + Vite app
    └── src/
        ├── components/
        │   ├── AdminDashboard.jsx
        │   ├── Quiz.jsx
        │   └── Sidebar.jsx
        ├── pages/
        │   └── Home.jsx
        └── App.jsx
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1 — Backend

```bash
cd backend
cp .env.example .env          # edit MONGODB_URI if needed
npm install
npm run dev                   # starts on http://localhost:5000
```

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev                   # starts on http://localhost:5173
```

The Vite dev server automatically proxies `/api` requests to the backend.

---

## Environment Variables (backend/.env)

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/placement_journey` | MongoDB connection string |
| `PORT` | `5000` | Backend server port |
| `ADMIN_TOKEN` | `admin123` | Secret token for admin routes |

---

## API Reference

### Articles

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/articles` | — | List all articles |
| GET | `/api/articles/:id` | — | Get single article |
| POST | `/api/articles` | ✅ Admin | Create article |
| PUT | `/api/articles/:id` | ✅ Admin | Update article |
| DELETE | `/api/articles/:id` | ✅ Admin | Delete article |

### Quiz

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/quiz` | — | List questions (filter: `?category=&company=&limit=`) |
| GET | `/api/quiz/:id` | — | Get single question |
| POST | `/api/quiz` | ✅ Admin | Create question |
| POST | `/api/quiz/seed` | ✅ Admin | Seed 5 sample questions |

Admin requests require the header: `x-admin-token: <ADMIN_TOKEN>`

---

## Features

- **📚 Article Schema** — Supports 8 categories (OS, DBMS, CN, DSA, OOP, System Design, Aptitude, Other), sub-categories, HTML body content, YouTube lecture links, and PDF links.
- **🗂️ Sidebar** — 3-level collapsible folder tree (Subject → Topic → 🎥 Video / 📄 PDF) with smooth CSS transitions.
- **🧠 Quiz Engine** — 30-second per-question countdown, previous/next navigation, question palette, auto-advance on timeout, result screen with per-question review.
- **🛠️ Admin Dashboard** — 4-panel admin UI: Add Lecture, Manage Articles (table with delete), Quiz Questions (with seed button), Settings.
- **🔒 Security** — isAdmin middleware, rate limiting (100 reads / 30 writes per 15 min), input allowlist on PUT to prevent NoSQL injection.
