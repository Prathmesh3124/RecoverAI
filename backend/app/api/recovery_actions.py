from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.payment import Payment
from app.models.recovery_action import RecoveryAction
from app.models.user import User
from app.api.auth import get_current_user


router = APIRouter(
    prefix="/recovery-actions",
    tags=["Recovery Actions"],
)


ALLOWED_ACTIONS = {
    "retry_payment",
    "send_reminder",
    "human_escalation",
}

ALLOWED_STATUSES = {
    "recommended",
    "executed",
    "cancelled",
}


@router.post("/")
def create_recovery_action(
    payment_id: int,
    action_type: str,
    status: str = "recommended",
    message: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if action_type not in ALLOWED_ACTIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid action_type. "
                "Allowed values: retry_payment, "
                "send_reminder, human_escalation."
            ),
        )

    if status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. "
                "Allowed values: recommended, "
                "executed, cancelled."
            ),
        )

    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found",
        )

    existing_action = (
        db.query(RecoveryAction)
        .filter(
            RecoveryAction.payment_id == payment_id,
            RecoveryAction.action_type == action_type,
            RecoveryAction.status == "executed",
        )
        .first()
    )

    if existing_action:
        raise HTTPException(
            status_code=409,
            detail=(
                "This recovery action has already "
                "been executed for this payment."
            ),
        )

    action = RecoveryAction(
        payment_id=payment_id,
        action_type=action_type,
        status=status,
        message=message,
    )

    db.add(action)
    db.commit()
    db.refresh(action)

    return action


@router.get("/")
def get_recovery_actions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    actions = (
        db.query(RecoveryAction)
        .order_by(RecoveryAction.created_at.desc())
        .all()
    )

    return actions