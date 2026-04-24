# SmartSeason Frontend (React)

A modern, reactive dashboard for crop monitoring built with React and Vite.

## 🛠️ Requirements
- Node.js 18+
- npm or yarn

## ⚙️ Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```

## 🎨 Design System
The UI uses a custom **Glassmorphism** design system implemented in `index.css`:
- **Colors**: Emerald 500 (Primary), Dark Blue (Background), Amber (At Risk).
- **Glass Effects**: Backdrop blur with subtle white borders.
- **Typography**: Outfit (Headings) and Inter (Body).
- **Animations**: Framer Motion for entrance transitions and hover states.

## 🏗️ Key Components
- **Dashboard**: Role-aware overview with summary cards and field grid.
- **Field Detail**: Detailed status history and observation form.
- **AuthContext**: Global state management for authentication and permissions.
