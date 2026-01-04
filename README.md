# CSV Analytics Dashboard (Customer Insights)

Lightweight **Customer Insights** dashboard for internal stakeholders (account managers and senior leadership).  
The app reads a **CSV dataset** (no database), **validates + normalises** it into a predictable schema, exposes **analytics via an API**, and presents **insights in a simple UI**.

> Focus: structure, clarity, correctness (not pixel-perfect styling).

---

## What this project does

### Backend (API)
- Loads CSV data from a file in the repository (optionally on startup and/or via an endpoint).
- Validates records against a defined schema.
  - Missing/invalid fields are handled gracefully.
  - “Invalid” rules are documented (see **Data validation rules**).
  - Errors are returned with clear messages.
- Normalises data into **typed models** (e.g., Pydantic) to keep the code predictable.
- Provides endpoints for:
  - **Summary** metrics for leadership
  - **Records** with pagination + filtering
  - **Analytics** endpoints for charts (group-bys, time series, breakdowns)
- Includes OpenAPI docs (FastAPI `/docs`), kept tidy and consistent.

### Frontend (Dashboard UI)
- Fetches data from the API and handles:
  - loading states
  - empty states
  - error states
- Displays:
  - at least **one chart** (bar/line/pie)
  - at least **one table/list** of records
  - at least **one filter/interaction** (search, date range, category, drill-down, etc.)
- Uses clear labels, units, and definitions so non-technical users can interpret results.

---

## Tech stack

- **Backend:** FastAPI (Python), Pydantic models, CORS enabled for Angular dev server
- **Frontend:** Angular
- **Storage:** none (in-memory; CSV file in repo)

If the stack is changed, the reasoning should be documented in **Design decisions**.

---

## Dataset

- CSV is stored in the repository (path configurable).
- The backend ingests the CSV and produces:
  - a normalised, typed representation for downstream logic
  - derived metrics for dashboards and charts

### Data validation rules (document your choices)
Define and document what “invalid” means. Example rules (adjust to match the actual dataset):
- **Required fields**: must be present and non-empty
- **Types**:
  - numeric fields must parse (e.g., revenue, quantity)
  - dates must parse (ISO `YYYY-MM-DD` recommended)
- **Ranges**:
  - amounts must be ≥ 0
  - dates must be valid calendar dates
- **Categoricals**:
  - known enums/categories (or allow free text but normalise casing/whitespace)
- **Duplicates**:
  - decide how to treat repeated IDs/rows (keep, merge, dedupe)

**Graceful handling** recommendations:
- Skip invalid rows and return counts + reasons in ingestion response, **or**
- Accept partial records with `null` for optional fields and flag as `invalid`, **or**
- Reject ingestion if error rate exceeds a threshold

Whichever approach you choose, keep it consistent and documented.

---

## API (suggested contract)

> Endpoint names and shapes should be consistent and documented in OpenAPI.

### Health
- `GET /health` → `{ status: "ok" }`

### Summary (leadership metrics)
- `GET /api/summary`
  - Example fields:
    - total records
    - date range covered
    - totals (e.g., total revenue)
    - averages (e.g., avg order value)
    - top categories/customers

### Records (table view)
- `GET /api/records`
  - Query params (example):
    - `page`, `page_size`
    - `search` (free text)
    - `from`, `to` (date range)
    - `category`, `status`, etc.
  - Returns:
    - `items: [...]`
    - `page`, `page_size`
    - `total`

### Analytics (charts)
Provide one or more endpoints such as:
- `GET /api/analytics/by-category`
- `GET /api/analytics/time-series`
- `GET /api/analytics/breakdown`

Each should return a chart-friendly shape like:
- `{ labels: [...], series: [...] }` or
- `[{ key: "...", value: 123 }, ...]`

### CSV ingestion (optional)
If supported:
- `POST /api/ingest` (multipart upload) or `POST /api/reload` (reload file from repo)

Return:
- number of rows processed
- number accepted/skipped
- validation errors (summarised)

---

## Frontend UX expectations

- Use plain language (“Revenue”, “Customers”, “Orders”), not raw column names.
- Provide definitions (tooltips/help text) for calculated metrics.
- Ensure chart axes/units are labeled.
- Avoid dumping raw CSV without context; show:
  - what the viewer is looking at
  - what filters apply
  - what action they might take (e.g., “These accounts have declining activity over 30 days”)

---

## Getting started (local development)

### Prerequisites
- Python 3.11+ (recommended)
- Node.js 18+ and npm
- Angular CLI (if not bundled)

### Backend (FastAPI)
From the backend folder (adjust if your structure differs):

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the API:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

- API: `http://localhost:8000/`
- OpenAPI docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

### Frontend (Angular)
From the frontend folder:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the dev server:
   ```bash
   npm start
   ```

- UI: `http://localhost:4200/`

> CORS is enabled on the backend for the Angular dev server.

---

## Testing

Add/keep tests for:
- CSV parsing + validation
- schema normalisation
- analytics calculations (grouping, time series)
- API response shapes

Typical commands (adjust to your tooling):
- Backend:
  ```bash
  pytest
  ```
- Frontend:
  ```bash
  npm test
  ```

---

## Project structure (example)

```
tech_test/
  backend/
    app/
      main.py
      models/
      services/
      api/
    tests/
    requirements.txt
  frontend/
    src/
      app/
  data/
    input.csv
```

---

## Design decisions (fill in)
Document decisions that affect correctness/UX:
- When ingestion happens (startup vs upload vs both)
- Validation strategy (reject vs skip vs mark invalid)
- Normalisation choices (type coercions, trimming strings, date parsing)
- Analytics definitions (e.g., what counts as an “active customer”)

---

## Troubleshooting

- **CORS errors:** confirm backend allows `http://localhost:4200`
- **CSV parse failures:** confirm delimiter/quote rules match the dataset
- **Empty dashboard:** ensure CSV file path is correct and ingestion ran successfully
- **Slow endpoints:** cache derived analytics in-memory if recomputing frequently