# RecoverAI

RecoverAI is a FastAPI + React revenue-recovery dashboard. It analyzes failed payments with a rule-based recovery scoring engine and recommends a recovery action.

## Run locally on Windows

### 1. Backend

Open PowerShell in `backend`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000
Swagger: http://127.0.0.1:8000/docs

If PowerShell blocks activation, use:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

### 2. Frontend

Open a second PowerShell in `frontend`:

```powershell
npm install
npm run dev
```

Frontend: http://localhost:5173

If `frontend/.env` does not exist, copy `.env.example` to `.env` and keep:

```text
VITE_API_URL=http://localhost:8000
```

## Demo flow

1. Open http://localhost:5173.
2. Sign in with an existing account, or create an account.
3. The dashboard shows revenue at risk, average recovery score, high-risk payments, and customers at risk.
4. In the AI recovery queue, click **Analyze** for a payment.
5. RecoverAI calculates a 0–100 recovery score and assigns Low/Medium/High risk.
6. The recommended action is one of: retry payment, send reminder, or human escalation.
7. Click **Execute** to create the recovery action.
8. Use customer search and customer details to inspect payment history.

## Important

The current AI decision engine is rule-based (customer value, failed-attempt count, payment amount, and failure reason). It is not a trained machine-learning model.

For local/demo use, the SQLite database `backend/recoverai.db` is included with sample data. The bundled database contains sample customers, payments, AI decisions, and recovery actions.

For production deployment, set a strong `SECRET_KEY` through the environment and use a production database/server configuration.
