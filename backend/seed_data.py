from app.db.database import SessionLocal
from app.models.user import User
from app.models.customer import Customer
from app.models.payment import Payment
from app.core.security import hash_password


def seed_data():
    db = SessionLocal()

    try:
        # Create demo user
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

        # Add customers
        customers = [
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

        db.add_all(customers)
        db.commit()

        # Refresh customers so we get their database IDs
        for customer in customers:
            db.refresh(customer)

        # Add failed payments
        payments = [
            Payment(
                customer_id=customers[0].id,
                amount=45000,
                currency="INR",
                status="failed",
                failure_reason="Insufficient funds",
                attempt_count=3,
            ),
            Payment(
                customer_id=customers[1].id,
                amount=18000,
                currency="INR",
                status="failed",
                failure_reason="Card declined",
                attempt_count=3,
            ),
            Payment(
                customer_id=customers[2].id,
                amount=12000,
                currency="INR",
                status="failed",
                failure_reason="Expired card",
                attempt_count=2,
            ),
            Payment(
                customer_id=customers[3].id,
                amount=4000,
                currency="INR",
                status="failed",
                failure_reason="Insufficient funds",
                attempt_count=1,
            ),
            Payment(
                customer_id=customers[4].id,
                amount=2500,
                currency="INR",
                status="failed",
                failure_reason="Card declined",
                attempt_count=1,
            ),
            Payment(
                customer_id=customers[5].id,
                amount=30000,
                currency="INR",
                status="failed",
                failure_reason="Card declined",
                attempt_count=4,
            ),
            Payment(
                customer_id=customers[6].id,
                amount=7000,
                currency="INR",
                status="failed",
                failure_reason="Expired card",
                attempt_count=2,
            ),
            Payment(
                customer_id=customers[7].id,
                amount=55000,
                currency="INR",
                status="failed",
                failure_reason="Insufficient funds",
                attempt_count=3,
            ),
        ]

        db.add_all(payments)
        db.commit()

        print("Seed data created successfully.")
        print(f"Demo user: {demo_email}")
        print("Demo password: RecoverAI@123")
        print(f"Customers added: {len(customers)}")
        print(f"Payments added: {len(payments)}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()