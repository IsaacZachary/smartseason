# SmartSeason Backend (API)

This is the Django-based REST API for the SmartSeason Field Monitoring System.

## 🛠️ Requirements
- Python 3.9+
- pip

## ⚙️ Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate it:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Seed demo data:
   ```bash
   python manage.py seed_data
   ```
6. Run server:
   ```bash
   python manage.py runserver
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login/`: Get JWT tokens.
- `GET /api/auth/me/`: Current user profile.

### Fields
- `GET /api/fields/`: List fields (Role-aware).
- `POST /api/fields/`: Create field (Admin only).
- `GET /api/fields/stats/`: Dashboard statistics.
- `POST /api/fields/<id>/add_update/`: Log a new observation.

## 🗄️ Models
- **User**: Custom user with `role` (Admin/Agent).
- **Field**: Core field data and `@property status` logic.
- **FieldUpdate**: History of observations and stage changes.
