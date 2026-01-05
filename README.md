# Tech Test Application - Setup Guide

A full-stack application with FastAPI backend and Angular frontend. The app is a business intelligence application designed to manage and analyze client account data, subscription metrics, and workflow performance.
### **Core Functionality**

**Dashboard & Analytics**
The main dashboard provides at-a-glance metrics tailored to user roles (Leadership and Account Manager views). Users can toggle between audience types to view relevant statistics including total accounts, active subscriptions, inactive accounts, and workflow distributions. The analytics module features interactive visualizations: pie charts showing subscription status breakdowns (active vs. inactive), bar charts comparing notifications sent versus billed, horizontal bar charts highlighting top-performing workflows, and detailed usage statistics segmented by account status. Key metrics include total accounts, messages processed, notifications sent/billed, and record counts across all client accounts.

**Account Management**
The Accounts page provides a way to fetch accounts and filter account based on UUID, account labels, subscription status and workflow name. The interface supports pagination for handling large datasets efficiently.

**Data Ingestion**
The ingestion page is used for bulk data uploads that supports CSV. Files are validated in real-time with detailed error reporting for header mismatches, showing missing columns, extra columns, and expected headers. Users can reload the baseline dataset from the starter CSV at any time, resetting all data to its original state.

The application is fully containerized with Docker. 

**Decisions Made for when a row of data is regarded as invalid**

- If a two rows have the same account_uuid and belong to the same workflow, one of the rows is regarded to be the source of truth. We pick the first row and drop the other rows as invalid. This is ensure simplicity of the app. Account UUID are regarded as unique per workflow. 

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
git clone https://github.com/Nanahawau/tech_test

cd tech_test/backend 
```

### **Step 3: Build and Start the Application**
```bash
# Build and start all services
docker compose build --no-cache
docker compose up
```

**First-time build takes 2-5 minutes.** Subsequent starts are much faster.

Open your browser:
- **Frontend:** http://localhost/login 
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

Create .env file using .env.sample as a sample file 

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



### **Run Frontend Tests**

Component tests were written on the frontend and controller tests were written for the backend.

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm test
```

### **Run Backend Tests**

```bash
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
pytest
```

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



### **Improvements**

- Write more tests to cover services on the frontend and backend 