import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.fuel import FuelLog
from app.models.maintenance import MaintenanceLog
from app.models.trip import Trip
from app.services.analytics_service import (
    get_cost_per_km,
    get_fuel_efficiency,
    get_kpis,
    get_vehicle_roi,
)


def _financial_data(db: Session) -> dict:
    kpis = get_kpis(db)
    roi_list = get_vehicle_roi(db)
    fuel = get_fuel_efficiency(db)
    cost_km = get_cost_per_km(db)
    total_fuel_cost = db.execute(select(func.coalesce(func.sum(FuelLog.cost), 0))).scalar() or 0
    total_maint_cost = db.execute(select(func.coalesce(func.sum(MaintenanceLog.cost), 0))).scalar() or 0
    total_rev = db.execute(
        select(func.coalesce(func.sum(Trip.revenue), 0)).where(Trip.status == "Completed")
    ).scalar() or 0
    return {
        "total_revenue": float(total_rev),
        "total_fuel_cost": float(total_fuel_cost),
        "total_maintenance_cost": float(total_maint_cost),
        "operational_cost": float(total_fuel_cost) + float(total_maint_cost),
        "kpis": kpis,
        "vehicle_roi": roi_list,
        "fuel_efficiency": fuel,
        "cost_per_km": cost_km,
    }


def generate_financial_csv(db) -> str:
    import pandas as pd
    data = _financial_data(db)
    rows = [
        ["FleetFlow Financial Summary", ""],
        ["Generated", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")],
        ["", ""],
        ["Summary", ""],
        ["Total Revenue (€)", f"{data['total_revenue']:.2f}"],
        ["Total Fuel Cost (€)", f"{data['total_fuel_cost']:.2f}"],
        ["Total Maintenance Cost (€)", f"{data['total_maintenance_cost']:.2f}"],
        ["Total Operational Cost (€)", f"{data['operational_cost']:.2f}"],
        ["Fuel Efficiency (km/L)", f"{data['fuel_efficiency']['fuel_efficiency_km_per_l']:.2f}"],
        ["Cost per KM (€)", f"{data['cost_per_km']['cost_per_km']:.2f}"],
        ["", ""],
        ["KPIs", ""],
        ["Active Fleet", data["kpis"]["active_fleet"]],
        ["Maintenance Alerts", data["kpis"]["maintenance_alerts"]],
        ["Utilization Rate (%)", data["kpis"]["utilization_rate"]],
        ["Pending Cargo", data["kpis"]["pending_cargo"]],
        ["", ""],
        ["Vehicle ROI", ""],
        ["Vehicle", "Revenue", "Costs", "Acquisition Cost", "ROI %"],
    ]
    for r in data["vehicle_roi"]:
        rows.append([
            r["vehicle_name"],
            f"{r['revenue']:.2f}",
            f"{r['costs']:.2f}",
            f"{r['acquisition_cost']:.2f}",
            f"{r['roi_percent']:.1f}",
        ])
    df = pd.DataFrame(rows)
    buf = io.StringIO()
    df.to_csv(buf, index=False, header=False)
    return buf.getvalue()


def generate_financial_pdf(db) -> bytes:
    data = _financial_data(db)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=inch, leftMargin=inch, topMargin=inch, bottomMargin=inch)
    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph("FleetFlow Financial Summary", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    story.append(Spacer(1, 20))

    summary_data = [
        ["Metric", "Value"],
        ["Total Revenue (€)", f"{data['total_revenue']:.2f}"],
        ["Total Fuel Cost (€)", f"{data['total_fuel_cost']:.2f}"],
        ["Total Maintenance Cost (€)", f"{data['total_maintenance_cost']:.2f}"],
        ["Total Operational Cost (€)", f"{data['operational_cost']:.2f}"],
        ["Fuel Efficiency (km/L)", f"{data['fuel_efficiency']['fuel_efficiency_km_per_l']:.2f}"],
        ["Cost per KM (€)", f"{data['cost_per_km']['cost_per_km']:.2f}"],
    ]
    t = Table(summary_data, colWidths=[3 * inch, 2 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
    ]))
    story.append(t)
    story.append(Spacer(1, 24))
    story.append(Paragraph("Vehicle ROI", styles["Heading2"]))
    roi_data = [["Vehicle", "Revenue", "Costs", "ROI %"]]
    for r in data["vehicle_roi"][:15]:
        roi_data.append([r["vehicle_name"], f"€{r['revenue']:.0f}", f"€{r['costs']:.0f}", f"{r['roi_percent']:.1f}%"])
    t2 = Table(roi_data, colWidths=[2 * inch, 1.2 * inch, 1.2 * inch, 1 * inch])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
    ]))
    story.append(t2)
    doc.build(story)
    return buf.getvalue()
