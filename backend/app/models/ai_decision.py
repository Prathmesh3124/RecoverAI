from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class AIDecision(Base):
    __tablename__ = "ai_decisions"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    payment_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("payments.id"),
        nullable=False,
        index=True,
    )

    risk_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    recovery_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    recommended_action: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )