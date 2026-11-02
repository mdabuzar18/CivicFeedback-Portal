# CivicFeedback Portal 🏛️
### Digital Public Service Feedback Loop (MERN Stack Prototype)

An end-to-end civic feedback application designed for university presentations. It provides a seamless mechanism where citizens can submit complaints or requests (e.g., infrastructure issues, sanitation problems), and municipal administrators can monitor, filter, and transition their progress statuses in real-time.

---

## 🏗️ Project Architecture

The application is structured into two modular components:
1. **`backend/`**: A Node.js/Express REST API using Mongoose models connected to MongoDB.
2. **`frontend/`**: A fast, modern React user interface bootstrapped with Vite and featuring customized premium CSS (dark theme, glassmorphism, responsive tables, animations).

---

## 🛠️ Key Features

- **Citizen Feedback Form**: Submits name, email, category, and a detailed description of the public issue.
- **Admin Dashboard Grid**: Displays summary status metrics (Total, Pending, In Progress, Resolved) and compiles complaints in a structured table.
- **Filtering System**: Allows sorting complaints by category (Infrastructure, Sanitation, Public Safety, etc.) and current status.
- **Dynamic Status Updates**: Dropdown menus in the administrator panel immediately trigger patch updates to the database.
- **Demo Seed Utility**: When presenting, if the database is empty, a single click will populate it with high-quality, realistic mock tickets.
- **Automatic User Linking**: The backend automatically tracks/groups submissions by checking the user's email, creating new citizen profiles dynamically.

---

## 📋 Environment Variables

Both the backend and frontend rely on environment variables. Pre-configured templates are available.

### Backend (`backend/.env`)
Create a file named `.env` in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/dpsp_db?retryWrites=true&w=majority
```
*Note: If no MONGODB_URI is provided, the backend falls back to `mongodb://127.0.0.1:27017/dpsp_db` for local database servers.*

### Frontend (`frontend/.env`)
Create a file named `.env` in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 How to Run the Application

Follow these steps to launch the system locally.

### Step 1: Start the Backend Server
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run the development server (runs nodemon, auto-reloading on changes):
   ```bash
   npm run dev
   ```
   *The backend will boot up at `http://localhost:5000`.*

### Step 2: Start the Frontend React App
1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend client will open on a local port (usually `http://localhost:5173`).*

---

## 📡 API Reference

### 1. Submit Feedback
- **Route**: `POST /api/feedback`
- **Payload**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "category": "Infrastructure",
    "description": "Large sinkhole opening near the bus station."
  }
  ```
- **Response**: `201 Created` returns the populated feedback object.

### 2. Fetch All Feedback
- **Route**: `GET /api/feedback`
- **Response**: `200 OK` returns list of feedbacks populated with citizen names and emails.

### 3. Update Status
- **Route**: `PATCH /api/admin/status/:id`
- **Payload**:
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Response**: `200 OK` returns the updated feedback object.

---

## ⚡ Demo / Presentation Guide

1. Ensure the backend is connected to MongoDB (Atlas or a local instances).
2. Start both the backend and frontend dev servers.
3. Open the **Admin Dashboard** first. Since the database is new, you'll see a dashed box at the bottom: **"Ready to Present? 🌱 Seed Demo Data"**.
4. Click this button to populate the UI with 4 pre-made complaints ranging from broken streetlights to water pressure issues.
5. Demonstrate changing a status to **"In Progress"** or **"Resolved"** using the dropdowns.
6. Switch back to the **Submit Feedback** tab and create a new issue. Submit it and verify the success toast.
7. Return to the dashboard and observe your new issue appearing instantly at the top of the queue.
