# AMS – Asset Management System  
**Milestone 2 Submission**

---

## 📘 Overview
AMS (Asset Management System) is a lightweight web application built using a **Python HTTPServer + SQLite backend** and a **HTML/CSS/JS frontend**.

For **Milestone 2**, the focus modules are:
- **Assets Management**
- **Locations Management**

Both modules are fully functional with create, read, update, and delete (CRUD) operations connected to a live REST API.

---

## ⚙️ Technologies Used
| Layer | Technology |
|-------|-------------|
| Backend | Python 3 (HTTPServer), SQLite |
| Frontend | HTML, CSS, jQuery, SweetAlert2 |
| Styling | `ams-theme.css` |
| Database | `ams.db` (SQLite) |

---

## 🗂 Project Structure
```
backend/
server.py
router.py
http_helpers.py
utils.py
db.py
db_setup.py
assets.py
locations.py
frontend/
css/
ams-theme.css
js/
assets.js
locations.js
assets.html
locations.html
ams.db
```

## How to Set Up and Run the Application

### 1️ - Clone the Repository
git clone https://github.com/sahilkumar-sk/Asset-Management-System.git
cd AMS Project

### 2️ - Create the Database
cd backend
python db_setup.py

### 3️ - Start the Backend Server
python server.py