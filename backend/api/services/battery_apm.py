import numpy as np
from sqlalchemy.orm import Session
from backend.api.models.models import Vehicle, TelemetryHistory
from datetime import datetime

class BatteryAPMService:
    def __init__(self, db: Session):
        self.db = db

    def get_fleet_health(self):
        """
        Retrieves the health status of all assets.
        """
        vehicles = self.db.query(Vehicle).all()
        # Update dynamically calculated fields just in case
        for v in vehicles:
            if v.has_thermal_anomaly:
                v.health_score = int(max(0, v.current_soh - 20))
            else:
                v.health_score = int(v.current_soh)
        return vehicles

    def get_asset_telemetry(self, asset_id: str):
        """
        Retrieves telemetry history for a specific asset.
        """
        telemetry = self.db.query(TelemetryHistory).filter(TelemetryHistory.vehicle_id == asset_id).order_by(TelemetryHistory.timestamp.asc()).all()
        return telemetry

    def analyze_degradation(self, asset_id: str):
        """
        Calculate state-of-health trend for a single asset from BMS telemetry
        and predict RUL (Remaining Useful Life).
        """
        vehicle = self.db.query(Vehicle).filter(Vehicle.id == asset_id).first()
        if not vehicle:
            return None

        telemetry = self.get_asset_telemetry(asset_id)
        if len(telemetry) < 10:
            return vehicle # Not enough data

        # Simple linear regression for degradation
        cycles = np.array([t.cycle_count for t in telemetry])
        soh = np.array([t.soh for t in telemetry])

        if len(np.unique(cycles)) > 1:
            m, c = np.polyfit(cycles, soh, 1)
        else:
            m, c = 0, soh[0]

        # Calculate RUL: cycles until SoH hits 80%
        if m < 0:
            target_cycle = (80.0 - c) / m
            remaining_cycles = max(0, target_cycle - cycles[-1])
            # For simplicity, assuming 1 cycle = 1 day utilization
            vehicle.rul_days = int(remaining_cycles)
        else:
            vehicle.rul_days = 365 # Default safe margin

        # Calculate Health Score (0-100)
        score = vehicle.current_soh
        if vehicle.has_thermal_anomaly:
            score -= 20 # Severe penalty for thermal anomaly

        vehicle.health_score = int(max(0, min(100, score)))

        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle
