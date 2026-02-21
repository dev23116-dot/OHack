from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import RequireFleetManagerOrFinancial, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.reporting_service import generate_financial_csv, generate_financial_pdf

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/financial-summary")
def get_financial_summary_report(
    format: Annotated[str, Query(description="Report format: csv or pdf")] = "csv",
    db: Annotated[Session, Depends(get_db)] = ...,
    current_user: Annotated[User, Depends(RequireFleetManagerOrFinancial)] = ...,
):
    if format.lower() == "csv":
        content = generate_financial_csv(db)
        return StreamingResponse(
            iter([content]),
            media_type="text/csv",
            headers={
                "Content-Disposition": 'attachment; filename="fleetflow-financial-summary.csv"',
            },
        )
    elif format.lower() == "pdf":
        content = generate_financial_pdf(db)
        return StreamingResponse(
            iter([content]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'attachment; filename="fleetflow-report.pdf"',
            },
        )
    raise HTTPException(status_code=400, detail="format must be csv or pdf")
