# AMS – Asset Management System  
**Milestone 3 Submission**

---

## Overview
AMS (Asset Management System) is a full‑stack web application built using a **Flask + SQLite backend** and a **HTML/CSS/JS frontend**.  The system allows an organisation to track its **assets**, manage **employees** and **locations**, assign assets to employees, and visualise key statistics on a dashboard.  Milestone 3 extends the project by adding authentication, a dashboard with charts, and a complete employees module, while refining the assets and locations modules.

---

## Features
- Asset, Employee, and Location management (CRUD)
- Asset assignment to employees
- User authentication (login/register/session)
- Interactive dashboard with charts
- Modular Flask backend architecture

---

## Database Design
- Assets: name, category, status, location_id, assigned_employee_id
- Employees: name, department, email, phone, status, location_id
- Locations: name, description
- Users: email, password_hash

---

## Technologies Used

| Layer     | Technology                                      |
|----------|--------------------------------------------------|
| Backend  | Python 3, Flask micro‑framework, SQLite database |
| Frontend | HTML5, CSS3, JavaScript (jQuery), SweetAlert2    |
| Charts   | Chart.js (bar and donut charts)                  |
| Styling  | Custom **ams‑theme.css**, FontAwesome icons      |
| Database | SQLite file (`ams.db`)                           |

---

## Project Structure
The repository is organised into a `backend` package and a collection of static files at the top level:



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
python app.py  # Main server entry point
```
