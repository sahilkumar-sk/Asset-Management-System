# AMS – Asset Management System  
**Milestone 2 Submission**

---

## Overview
AMS (Asset Management System) is a lightweight web application built using a **Python HTTPServer + SQLite backend** and a **HTML/CSS/JS frontend**.

For **Milestone 2**, the focus modules are:
- **Assets Management**
- **Locations Management**

Both modules are fully functional with create, read, update, and delete (CRUD) operations connected to a live REST API.

---

## Technologies Used
| Layer | Technology |
|-------|-------------|
| Backend | Python 3 (HTTPServer), SQLite |
| Frontend | HTML, CSS, jQuery, SweetAlert2 |
| Styling | `ams-theme.css` |
| Database | `ams.db` (SQLite) |

---

## Project Structure
```
backend/
server.py
router.py
http_helpers.py
utils.py
db.py
db_setup.py
repositories/
    assets.py
    employees.py
    locations.py
    users.py
frontend/
css/
    ams-theme.css
    auth.css
js/
    assets.js
    locations.js
    dashboard.js
    employees.js
    login.js
    register.js
assets.html
locations.html
employees.html
dashboard.html
login.html
register.html
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