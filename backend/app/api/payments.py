from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.models.customer import Customer
from app.models.payment import Payment


router = APIRouter(
    prefix="/payments",
    tags=["Payments"],
)


@router.post("/")
def create_payment(
    customer_id: int,
    amount: float,
    status: str = "failed",
    currency: str = "INR",
    failure_reason: str | None = None,
    attempt_count: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    payment = Payment(
        customer_id=customer_id,
        amount=amount,
        status=status,
        currency=currency,
        failure_reason=failure_reason,
        attempt_count=attempt_count,
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment


@router.get("/")
def get_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payments = db.query(Payment).all()

    return payments