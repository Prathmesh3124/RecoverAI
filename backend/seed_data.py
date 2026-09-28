from app.db.database import SessionLocal
from app.models.user import User
from app.models.customer import Customer
from app.models.payment import Payment
from app.core.security import hash_password


DEMO_EMAIL = "demo@recoverai.com"
DEMO_PASSWORD = "RecoverAI@123"


def seed_data():
    db = SessionLocal()

    try:
        # -------------------------
        # Demo user
        # -------------------------
        demo_user = (
            db.query(User)
            .filter(User.email == DEMO_EMAIL)
            .first()
        )

        if not demo_user:
            demo_user = User(
                name="RecoverAI Demo",
                email=DEMO_EMAIL,
                password_hash=hash_password(DEMO_PASSWORD),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

        # -------------------------
        # Customers
        # -------------------------
        customer_data = [
            {
                "name": "Priya Sharma",
                "email": "priya.sharma@example.com",
                "company": "FinEdge Technologies",
                "total_value": 125000,
                "risk_level": "High",
            },
            {
                "name": "Rahul Verma",
                "email": "rahul.verma@example.com",
                "company": "CloudNova Systems",
                "total_value": 68000,
                "risk_level": "High",
            },
            {
                "name": "Sneha Kapoor",
                "email": "sneha.kapoor@example.com",
                "company": "BrightMart",
                "total_value": 32000,
                "risk_level": "Medium",
            },
            {
                "name": "Vikram Singh",
                "email": "vikram.singh@example.com",
                "company": "DataWorks India",
                "total_value": 18500,
                "risk_level": "Medium",
            },
            {
                "name": "Ananya Patel",
                "email": "ananya.patel@example.com",
                "company": "GreenLeaf Retail",
                "total_value": 8500,
                "risk_level": "Low",
            },
            {
                "name": "Rohan Desai",
                "email": "rohan.desai@example.com",
                "company": "UrbanCart",
                "total_value": 52000,
                "risk_level": "High",
            },
            {
                "name": "Neha Joshi",
                "email": "neha.joshi@example.com",
                "company": "PixelCraft",
                "total_value": 14000,
                "risk_level": "Low",
            },
            {
                "name": "Aditya Rao",
                "email": "aditya.rao@example.com",
                "company": "ScaleUp Labs",
                "total_value": 92000,
                "risk_level": "High",
            },
        ]

        customers = []

        for data in customer_data:
            customer = (
                db.query(Customer)
                .filter(
                    Customer.email == data["email"],
                    Customer.user_id == demo_user.id,
                )
                .first()
            )

            if not customer:
                customer = Customer(
                    user_id=demo_user.id,
                    **data,
                )
                db.add(customer)
                db.commit()
                db.refresh(customer)

            customers.append(customer)

        # -------------------------
        # Failed payments
        # -------------------------
        payment_data = [
            (0, 45000, "Insufficient funds", 3),
            (1, 18000, "Card declined", 3),
            (2, 12000, "Expired card", 2),
            (3, 4000, "Insufficient funds", 1),
            (4, 2500, "Card declined", 1),
            (5, 30000, "Card declined", 4),
            (6, 7000, "Expired card", 2),
            (7, 55000, "Insufficient funds", 3),
        ]

        payments_added = 0

        for index, amount, failure_reason, attempt_count in payment_data:
            customer = customers[index]

            existing_payment = (
                db.query(Payment)
                .filter(Payment.customer_id == customer.id)
                .first()
            )

            if not existing_payment:
                payment = Payment(
                    customer_id=customer.id,
                    amount=amount,
                    currency="INR",
                    status="failed",
                    failure_reason=failure_reason,
                    attempt_count=attempt_count,
                )
                db.add(payment)
                db.commit()
                payments_added += 1

        print("Seed data ready.")
        print(f"Demo user: {DEMO_EMAIL}")
        print(f"Demo password: {DEMO_PASSWORD}")
        print(f"Customers available: {len(customers)}")
        print(f"New payments added: {payments_added}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()