# 🌽 SmartSeason: Shamba Monitoring System

SmartSeason is a professional agricultural telemetry platform designed to monitor crop lifecycles, track field agent activity, and provide proactive risk alerts for large-scale farming operations in Kenya.

## 🚀 Live Deployment
**URL**: [https://smartseason-rouge.vercel.app](https://smartseason-rouge.vercel.app)

### 🔑 Demo Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@smartseason.com` | `Admin@123` |
| **Field Agent** | `agent1@smartseason.com` | `Agent@123` |

---

## 🏗️ Project Architecture
The project utilizes a **Flattened Monorepo** structure optimized for Vercel Serverless Functions.

### 📂 Directory Structure
- `/core/`: Central Django configuration (Settings, URL routing).
- `/users/`: User management, custom authentication, and role logic.
- `/fields/`: Shamba management, telemetry recording, and risk assessment logic.
- `/frontend/`: React + Vite SPA with a premium glassmorphism design system.
- `index.py`: The root WSGI entry point for Vercel Python runtime.
- `vercel.json`: Deployment orchestration and routing rules.

---

## 🧠 Smart Features & Logic

### 🟢🟡⚫ Status Mapping
The system proactively assesses the health of every Shamba plot:
- 🟢 **Active**: Growth is on schedule and reports are regular.
- 🟡 **At Risk**: Triggered if **no update** is received for 14 days OR if a crop stays in the "Planted" stage for >30 days.
- ⚫ **Completed**: Lifecycle finished (Harvested).

### 🛠️ Tech Stack
- **Backend**: Django 4.2 + Django REST Framework.
- **Frontend**: React + Framer Motion (Animations) + Lucide Icons.
- **Database**: Managed PostgreSQL (Neon).
- **Security**: JWT-based Authentication with role-specific query filtering.

---

## 🛠️ Local Setup
1. **Backend**:
   ```bash
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py seed_data
   python manage.py runserver
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

---

## 👨‍💻 Submission Details
- **Developer**: Isaac Zachary
- **Email**: [isaaczachary18@gmail.com](mailto:isaaczachary18@gmail.com)
- **Portfolio**: [izach.netlify.app](https://izach.netlify.app)
- **Phone**: +254 759 325 915
- **Project**: SmartSeason Agricultural Telemetry Platform
- **Date**: April 2026

## ⚖️ License
This project was developed as a technical assessment for SmartSeason.
