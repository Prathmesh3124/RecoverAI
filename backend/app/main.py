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
    allow_origins=["http://localhost:5173",
                   "http://127.0.0.1:5173",
                   "https://recoverai-frontend-p7xy.onrender.com",
                   ],
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

@app.post("/setup-demo")
def setup_demo():
    import sqlite3

    from app.core.security import hash_password
    from app.db.database import SessionLocal
    from app.models.user import User
    from app.models.customer import Customer

    db = SessionLocal()

    try:
        # Make sure the production database has user_id
        db_path = "recoverai.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        columns = cursor.execute(
            "PRAGMA table_info(customers)"
        ).fetchall()

        column_names = [column[1] for column in columns]

        if "user_id" not in column_names:
            cursor.execute(
                "ALTER TABLE customers ADD COLUMN user_id INTEGER REFERENCES users(id)"
            )
            conn.commit()

        conn.close()

        # Create demo user if needed
        demo_email = "demo@recoverai.com"

        demo_user = (
            db.query(User)
            .filter(User.email == demo_email)
            .first()
        )

        if not demo_user:
            demo_user = User(
                name="RecoverAI Demo",
                email=demo_email,
                password_hash=hash_password("RecoverAI@123"),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

               # Assign existing unassigned customers to demo user
        unassigned = (
            db.query(Customer)
            .filter(Customer.user_id == None)
            .all()
        )

        for customer in unassigned:
            customer.user_id = demo_user.id

        db.commit()

        # Create demo customers if none exist
        existing_count = (
            db.query(Customer)
            .filter(Customer.user_id == demo_user.id)
            .count()
        )

        if existing_count == 0:
            demo_customers = [
                Customer(
                    user_id=demo_user.id,
                    name="Priya Sharma",
                    email="priya.sharma@example.com",
                    company="FinEdge Technologies",
                    total_value=125000,
                    risk_level="High",
                ),
                Customer(
                    user_id=demo_user.id,
                    name="Rahul Verma",
                    email="rahul.verma@example.com",
                    company="CloudNova Systems",
                    total_value=68000,
                    risk_level="High",
                ),
                Customer(
                    user_id=demo_user.id,
                    name="Sneha Kapoor",
                    email="sneha.kapoor@example.com",
                    company="BrightMart",
                    total_value=32000,
                    risk_level="Medium",
                ),
                Customer(
                    user_id=demo_user.id,
                    name="Vikram Singh",
                    email="vikram.singh@example.com",
                    company="DataWorks India",
                    total_value=18500,
                    risk_level="Medium",
                ),
                Customer(
                    user_id=demo_user.id,
                    name="Ananya Patel",
                    email="ananya.patel@example.com",
                    company="GreenLeaf Retail",
                    total_value=8500,
                    risk_level="Low",
                ),
                Customer(
                    user_id=demo_user.id,
                    name="Rohan Desai",
                    email="rohan.desai@example.com",
                    company="UrbanCart",
                    total_value=52000,
                    risk_level="High",
                ),
                Customer(
                    user_id=demo_user.id,
                    name="Neha Joshi",
                    email="neha.joshi@example.com",
                    company="PixelCraft",
                    total_value=14000,
                    risk_level="Low",
                ),
                Customer(
                    user_id=demo_user.id,
                    name="Aditya Rao",
                    email="aditya.rao@example.com",
                    company="ScaleUp Labs",
                    total_value=92000,
                    risk_level="High",
                ),
            ]

            db.add_all(demo_customers)
            db.commit()

        total_customers = (
            db.query(Customer)
            .filter(Customer.user_id == demo_user.id)
            .count()
        )

        return {
            "status": "success",
            "demo_user_id": demo_user.id,
            "customers_assigned": len(unassigned),
            "demo_customers": total_customers,
        }

    finally:
        db.close()