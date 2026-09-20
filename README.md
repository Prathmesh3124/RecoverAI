# RecoverAI

**RecoverAI is an AI-powered revenue recovery platform that analyzes failed payments, assesses recovery risk, and recommends prioritized recovery actions.**

Built with **React, FastAPI, Python, and SQLite**, RecoverAI provides a dashboard for monitoring revenue at risk, analyzing failed payments, reviewing customer payment history, and executing recommended recovery actions.

> **Note:** The current recovery decision engine is rule-based rather than a trained machine-learning model. It uses customer value, failed-attempt count, payment amount, and failure reason to calculate recovery risk and recommend an action.

## Features

* Revenue-at-risk dashboard
* Failed payment analysis
* Recovery scoring from **0–100**
* Low / Medium / High risk classification
* AI recovery queue
* Recommended recovery actions
* Retry payment action
* Customer reminder action
* Human escalation action
* Customer search and payment history
* Recovery action tracking
* Authentication and protected API routes
* Interactive FastAPI Swagger documentation
* SQLite database with sample/demo data

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* JWT-based authentication

### Development

* Git / GitHub
* Node.js / npm
* Python virtual environment

## Project Structure

```text
RecoverAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── .env.example
│   ├── requirements.txt
│   └── seed_data.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── README.md
└── START_HERE.txt
```

## Run Locally on Windows

### 1. Clone the repository

```powershell
git clone https://github.com/Prathmesh3124/RecoverAI.git
cd RecoverAI
```

### 2. Backend Setup

Open PowerShell in the `backend` directory:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell blocks virtual-environment activation:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

Start the FastAPI backend:

```powershell
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open a **second PowerShell window** in the `frontend` directory:

```powershell
cd frontend
npm install
```

If `frontend/.env` does not exist, create it from the example:

```powershell
Copy-Item .env.example .env
```

The local API URL should be:

```text
VITE_API_URL=http://localhost:8000
```

Start the React development server:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Demo Flow

1. Open `http://localhost:5173`.
2. Sign in with an existing account or create an account.
3. Review the dashboard metrics:

   * Revenue at risk
   * Average recovery score
   * High-risk payments
   * Customers at risk
4. Open the **AI Recovery Queue**.
5. Click **Analyze** for a payment.
6. RecoverAI calculates a **0–100 recovery score** and assigns a Low, Medium, or High risk level.
7. Review the recommended recovery action.
8. Click **Execute** to create the recovery action.
9. Use customer search and customer details to inspect payment history.

## Recovery Decision Engine

The current decision engine is **rule-based**.

The recovery score considers factors including:

* Customer value
* Number of failed payment attempts
* Payment amount
* Payment failure reason

Based on these factors, RecoverAI assigns a recovery-risk level and recommends one of the following actions:

```text
Retry Payment
Send Reminder
Human Escalation
```

This approach is intentionally transparent and deterministic for the current project/demo version.

## Database

For local/demo use, the project uses SQLite.

The repository's local development setup may contain sample data for:

* Customers
* Payments
* AI decisions
* Recovery actions

For production deployment, use a production-grade database configuration rather than relying on the local SQLite development database.

## Environment Variables

### Backend

Use `backend/.env.example` as the template for backend environment variables.

For production, configure a strong secret key through the environment rather than committing secrets to GitHub.

### Frontend

Use `frontend/.env.example` as the template.

For local development:

```text
VITE_API_URL=http://localhost:8000
```

**Never commit real secrets, passwords, API keys, or production credentials to GitHub.**

## API Documentation

When the backend is running, FastAPI provides interactive Swagger documentation at:

```text
http://127.0.0.1:8000/docs
```

This can be used to inspect and test the available API endpoints.

## Project Status

RecoverAI is currently configured as a local/demo application.

The current version focuses on:

* Revenue recovery analysis
* Rule-based recovery scoring
* Payment risk classification
* Recovery recommendations
* Customer/payment visibility
* Recovery action execution

Deployment and production infrastructure can be added separately.

## GitHub

Repository:

https://github.com/Prathmesh3124/RecoverAI
