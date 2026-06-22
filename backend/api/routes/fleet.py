from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.api.schemas.schemas import VehicleResponse, ICEVehicleResponse
from backend.api.services.battery_apm import BatteryAPMService
from backend.api.services.planner import ElectrificationPlannerService

router = APIRouter()

@router.get("/health", response_model=List[VehicleResponse])
def get_fleet_health(db: Session = Depends(get_db)):
    """Get overall fleet health status and predictive maintenance metrics."""
    apm = BatteryAPMService(db)
    return apm.get_fleet_health()

@router.get("/telemetry/{asset_id}", response_model=VehicleResponse)
def get_asset_telemetry(asset_id: str, db: Session = Depends(get_db)):
    """Get full telemetry trace and calculate RUL for a specific asset."""
    apm = BatteryAPMService(db)
    vehicle = apm.analyze_degradation(asset_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Asset not found")
    vehicle.telemetry_history = apm.get_asset_telemetry(asset_id)
    return vehicle

@router.get("/planner", response_model=List[ICEVehicleResponse])
def get_electrification_plan(db: Session = Depends(get_db)):
    """Get EV replacement readiness scores for the conventional fleet."""
    planner = ElectrificationPlannerService(db)
    return planner.get_readiness_scores()
