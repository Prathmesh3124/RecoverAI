from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.customers import router as customers_router
from app.api.payments import router as payments_router
from app.api.recovery_actions import router as recovery_actions_router
from app.api.ai_decisions import router as ai_decisions_router
from app.db.database import Base, engine
from app.models.user import User
from app.models.customer import Customer
from app.models.payment import Payment
from app.models.recovery_action import RecoveryAction
from app.models.ai_decision import AIDecision

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RecoverAI API",
    description="AI-powered revenue recovery platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(customers_router)
app.include_router(payments_router)
app.include_router(recovery_actions_router)
app.include_router(ai_decisions_router)


@app.get("/")
def root():
    return {
        "message": "RecoverAI API is running",
        "status": "healthy",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "recoverai-backend",
    }