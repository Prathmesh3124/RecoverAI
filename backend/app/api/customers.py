from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.models.customer import Customer


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


@router.post("/")
def create_customer(
    name: str,
    email: str,
    company: str | None = None,
    total_value: float = 0.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = Customer(
        name=name,
        email=email,
        company=company,
        total_value=total_value,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return customer


@router.get("/")
def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customers = db.query(Customer).all()

    return customers