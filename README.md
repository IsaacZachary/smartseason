# SmartSeason: Shamba Field Monitoring System

SmartSeason is a full-stack agricultural telemetry platform built to monitor crop lifecycles, track field agent activity, and surface proactive risk alerts for farming operations across Kenya.

---

## Live Deployment

URL: [https://smartseason-rouge.vercel.app](https://smartseason-rouge.vercel.app)

### Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| Administrator | admin@smartseason.com | admin123 |
| Field Agent | agent1@smartseason.com | agent123 |

---

## Project Structure

The project uses a flattened monorepo. The Django backend lives at the repository root alongside the React frontend. There is no separate `/backend` directory.

```
smartseason/
|
|-- core/               # Django settings, root URL configuration
|-- fields/             # Field model, telemetry endpoints, status logic
|-- users/              # Custom user model, JWT auth, role management
|-- api/                # Shared API utilities
|-- frontend/           # React + Vite SPA
|   |-- src/
|   |   |-- api/        # Axios API client
|   |   |-- components/ # Shared UI components (modals, cards)
|   |   |-- context/    # Auth context and state
|   |   |-- hooks/      # Custom React hooks
|   |   |-- pages/      # Dashboard, FieldDetail views
|   |   |-- assets/     # Static assets (logo)
|   |   |-- index.css   # Global design system (CSS variables)
|   |   |-- App.jsx     # Router and layout
|   |   `-- main.jsx    # Entry point
|
|-- manage.py           # Django management entry point
|-- index.py            # Vercel WSGI entry point
|-- wsgi.py             # WSGI config
|-- requirements.txt    # Python dependencies
|-- runtime.txt         # Python version for Vercel
|-- build.sh            # Frontend build script for deployment
`-- vercel.json         # Deployment routing rules
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.2 + Django REST Framework |
| Auth | JWT (SimpleJWT) with role-based query filtering |
| Database | PostgreSQL via Neon (managed, serverless) |
| Frontend | React 18 + Vite + Framer Motion + Lucide Icons |
| Deployment | Vercel (monorepo, serverless Python runtime) |

---

## Status Logic

Field status is computed dynamically on every request, not stored.

- **Active**: Growth is on schedule and field reports are regular.
- **At Risk**: Triggered when no update is received for 14+ days, or when a crop remains in the Planted stage for more than 30 days.
- **Completed**: Field has been harvested.

---

## Local Setup

**Backend** (run from repository root):
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies API requests to `http://localhost:8000` in development and to `/_/backend/` in production.

---

## Design Decisions

- The backend is flattened to the repository root so Vercel can resolve Django as a serverless Python function without additional configuration.
- `vercel.json` maps `/_/backend/*` routes to the Django WSGI app and all other routes to the React SPA build, which allows both to coexist under one domain.
- Field status is a computed model property rather than a database field. This prevents stale data and ensures risk signals are always accurate at query time.
- Agents are filtered at the queryset level, not the view level, so the restriction applies consistently across all endpoints.

---

## Submission Details

- **Developer**: Isaac Siko Zachary
- **Email**: isaaczachary18@gmail.com
- **Portfolio**: izach.netlify.app
- **Phone**: +254 759 325 915
- **Assessment**: SmartSeason Field Monitoring System, Shamba Records
- **Submitted**: April 2026
