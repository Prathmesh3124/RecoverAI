from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.models.customer import Customer
from app.models.payment import Payment
from app.models.ai_decision import AIDecision


router = APIRouter(
    prefix="/ai-decisions",
    tags=["AI Decisions"],
)


def calculate_recovery_decision(
    customer: Customer,
    payment: Payment,
):
    score = 0
    reasons = []

    # Higher-value customers get higher priority.
    if customer.total_value >= 100000:
        score += 30
        reasons.append("customer has very high value")
    elif customer.total_value >= 50000:
        score += 20
        reasons.append("customer has high value")
    elif customer.total_value >= 20000:
        score += 10
        reasons.append("customer has moderate value")

    # Repeated payment failures increase recovery risk.
    if payment.attempt_count >= 3:
        score += 30
        reasons.append("payment has failed multiple times")
    elif payment.attempt_count == 2:
        score += 20
        reasons.append("payment has already failed once")

    # Larger failed payments deserve more attention.
    if payment.amount >= 50000:
        score += 25
        reasons.append("payment amount is very high")
    elif payment.amount >= 20000:
        score += 15
        reasons.append("payment amount is significant")
    elif payment.amount >= 5000:
        score += 5
        reasons.append("payment amount is meaningful")

    # Some failures may be worth a different recovery approach.
    if payment.failure_reason:
        failure_reason = payment.failure_reason.lower()

        if "insufficient" in failure_reason:
            score += 10
            reasons.append(
                "payment failed because of insufficient funds"
            )
        elif "expired" in failure_reason:
            score += 10
            reasons.append(
                "payment method may have expired"
            )
        elif "declined" in failure_reason:
            score += 15
            reasons.append(
                "payment was declined"
            )

    # Keep the score within 0-100.
    score = min(score, 100)

    if score >= 70:
        risk_level = "High"
        recommended_action = "human_escalation"
    elif score >= 40:
        risk_level = "Medium"
        recommended_action = "send_reminder"
    else:
        risk_level = "Low"
        recommended_action = "retry_payment"

    if reasons:
        reason = " and ".join(reasons)
    else:
        reason = "payment has relatively low recovery risk"

    return (
        risk_level,
        score,
        recommended_action,
        reason,
    )


@router.post("/analyze/{payment_id}")
def analyze_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    customer = (
        db.query(Customer)
        .filter(Customer.id == payment.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    (
        risk_level,
        score,
        recommended_action,
        reason,
    ) = calculate_recovery_decision(
        customer,
        payment,
    )

    existing_decision = (
        db.query(AIDecision)
        .filter(
            AIDecision.payment_id == payment.id
        )
        .order_by(AIDecision.id.desc())
        .first()
    )

    if existing_decision:
        existing_decision.risk_level = risk_level
        existing_decision.recovery_score = score
        existing_decision.recommended_action = (
            recommended_action
        )
        existing_decision.reason = reason

        db.commit()
        db.refresh(existing_decision)

        return existing_decision

    decision = AIDecision(
        payment_id=payment.id,
        risk_level=risk_level,
        recovery_score=score,
        recommended_action=recommended_action,
        reason=reason,
    )

    db.add(decision)
    db.commit()
    db.refresh(decision)

    return decision


@router.get("/")
def get_ai_decisions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    decisions = (
        db.query(AIDecision)
        .all()
    )

    return decisions