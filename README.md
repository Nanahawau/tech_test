# Tech Test Application - Setup Guide

A full-stack application with FastAPI backend and Angular frontend.


## Prerequisites
### For Docker Setup
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### For Local Setup
- **Backend:**
  - Python 3.11+
  - pip (Python package manager)
- **Frontend:**
  - Node.js 20+ (LTS)
  - npm 9+

---

## Running with Docker (Recommended)

Docker containerizes both the backend and frontend, making setup quick and consistent across different environments.

### **Step 1: Start Docker Desktop**

Make sure Docker Desktop is running (check for the Docker icon in your menu bar/system tray).

### **Step 2: Clone the Repository**
```bash
git clone <https://github.com/Nanahawau/tech_test>
cd tech_test
```

### **Step 3: Build and Start the Application**
```bash
# Build and start all services
docker compose up --build
```

**First-time build takes 2-5 minutes.** Subsequent starts are much faster.

### **Step 4: Access the Application**

Once you see these logs:
```
tech_test_backend   | INFO: Application startup complete.
tech_test_frontend  | /docker-entrypoint.sh: Configuration complete
```

Open your browser:
- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### **Step 5: Stop the Application**
```bash
# Press Ctrl+C in the terminal, then:
docker compose down
```

---

## Running Locally (Without Docker)

Run the backend and frontend separately on your machine.

### **Backend Setup**
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: http://localhost:8000

**Keep this terminal open.**

---

### **Frontend Setup**

Open a **new terminal window/tab**:
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run start
```

Frontend will be available at: http://localhost:4200

**Keep this terminal open too.**

---

## Accessing the Application

| Component | Docker URL | Local URL |
|-----------|-----------|-----------|
| **Frontend** | http://localhost | http://localhost:4200 |
| **Backend API** | http://localhost:8000 | http://localhost:8000 |
| **API Documentation** | http://localhost:8000/docs | http://localhost:8000/docs |

---

## Demo Credentials 
- email: test@gmail.com
- password: test