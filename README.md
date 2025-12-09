# AMS – Asset Management System  
**Milestone 3 Submission**

---

## Overview
AMS (Asset Management System) is a fully functional web application built using a **Flask + SQLite backend** and a **HTML/CSS/JS frontend**.

For **Milestone 3**, the system now includes:
- **Authentication (Login & Registration)**
- **Assets Management (Full CRUD + assignment)**
- **Employees Management (Full CRUD + assigned assets tracking)**
- **Locations Management (Full CRUD)**
- **Dashboard Analytics (Charts + KPIs)**

All modules interact with a live Flask REST API and are fully integrated into the system.

---

## Technologies Used
| Layer | Technology |
|-------|-------------|
| Backend | Python 3, Flask, SQLite |
| Frontend | HTML, CSS, jQuery, SweetAlert2, Chart.js |
| Styling | `ams-theme.css` |
| Database | `ams.db` (SQLite) |

---

## Project Structure

```
backend/
│
├── app.py                 # Main server entry point
├── db.py                  # SQLite connection handler
├── db_setup.py            # Creates initial database + tables
│
├── ams.db                 # SQLite database (auto-generated)
├── ams.db-shm             # SQLite runtime file
├── ams.db-wal             # SQLite WAL file
│
├── routes/                # All API route handlers
│     ├── assets.py
│     ├── employees.py
│     ├── locations.py
│     ├── users.py
│     └── dashboard.py
│
├── repositories/          # Database query logic
│     ├── assets.py
│     ├── employees.py
│     ├── locations.py
│     └── users.py
│
├── services/              # Business logic (Dashboard calculations)
│     └── dashboard.py
│
└── static/                # Frontend (served by backend)
      ├── css/
      │     ├── ams-theme.css
      │     └── auth.css
      │
      ├── js/
      │     ├── assets.js
      │     ├── employees.js
      │     ├── locations.js
      │     ├── dashboard.js
      │     ├── login.js
      │     ├── register.js
      │     ├── session.js
      │     └── config.js
      │
      ├── assets.html
      ├── dashboard.html
      ├── employees.html
      ├── locations.html
      ├── login.html
      └── register.html
```

## How to Set Up and Run the Application

### 1️ - Clone the Repository
```
git clone https://github.com/sahilkumar-sk/Asset-Management-System.git
cd Asset-Management-System
```

### 2️ - Create the Database
```
cd backend
python db_setup.py
```
### 3️ - Start the Backend Server
```
python server.py
```
