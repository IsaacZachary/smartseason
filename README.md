# 🌱 SmartSeason Field Monitoring System

**SmartSeason** is a premium full-stack solution designed for agricultural management. It bridges the gap between field operations and coordination by providing real-time tracking of crop stages and automated health monitoring.

---

## ✨ Features

- **Dual-Role Interface**: Tailored dashboards for Administrators (Coordinators) and Field Agents.
- **Automated Health Monitoring**: Computed "At Risk" status based on growth delays and update frequency.
- **Real-time Lifecycle Tracking**: Monitor fields through *Planted*, *Growing*, *Ready*, and *Harvested* stages.
- **Premium Design**: Modern Glassmorphism UI built with React and Framer Motion.
- **Secure API**: Stateless JWT authentication with role-based permissions.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Axios, Framer Motion, Lucide Icons |
| **Backend** | Django 4.2, Django REST Framework, SimpleJWT |
| **Database** | SQLite (Development) / PostgreSQL Ready |
| **Styling** | Vanilla CSS (Custom Design System) |

---

## 🚦 Quick Start

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smartseason
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@smartseason.com` | `Admin@123` |
| **Field Agent 1** | `agent1@smartseason.com` | `Agent@123` |
| **Field Agent 2** | `agent2@smartseason.com` | `Agent@123` |

---

## 🧠 Design Decisions & Business Logic

### Computed Status Strategy
Instead of manual status entry, SmartSeason uses an objective computation model:

- **Completed**: Automatically assigned when `stage == "Harvested"`.
- **At Risk**: 
  - **Growth Delay**: If a field remains in "Planted" or "Growing" for >30 days.
  - **Neglect**: If no observations have been logged for >14 days.
- **Active**: Standard progression state.

### Role Permissions
- **Admins**: Full visibility of all fields, global statistics, and agent management.
- **Agents**: Focused view showing only assigned fields to streamline field work.

---

## 📁 Project Structure
- `/backend`: Django REST API core.
- `/frontend`: Vite + React application.
- `README.md`: Project overview and entry point.

---

## 👤 Author & Contact

**Isaac Zachary**  
- **Email**: [isaaczachary18@gmail.com](mailto:isaaczachary18@gmail.com)  
- **Portfolio**: [izach.netlify.app](https://izach.netlify.app)  
- **Phone**: [+254 759 325 915](tel:+254759325915)  
- **GitHub**: [github.com/IsaacZachary](https://github.com/IsaacZachary)
