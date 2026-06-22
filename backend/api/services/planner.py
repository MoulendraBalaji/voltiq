from sqlalchemy.orm import Session
from backend.api.models.models import ICEVehicle

class ElectrificationPlannerService:
    def __init__(self, db: Session):
        self.db = db

    def get_readiness_scores(self):
        """
        Analyses a conventional fleet's duty cycles and scores each vehicle's EV replacement readiness.
        """
        vehicles = self.db.query(ICEVehicle).all()
        results = []
        for v in vehicles:
            # Range adequacy: Daily km vs typical EV range (e.g. 250km)
            range_score = max(0, min(100, (250 / v.daily_km) * 100)) if v.daily_km > 0 else 100
            
            # Charging window fit: Dwell time vs typical charge time (e.g. 6 hours)
            charge_score = max(0, min(100, (v.dwell_time_hours / 6.0) * 100))
            
            # Payload compatibility
            payload_score = max(0, min(100, 100 - (v.payload_tons - 5) * 2))
            
            # Weighted average
            readiness_score = int((range_score * 0.5) + (charge_score * 0.3) + (payload_score * 0.2))
            
            # Model match recommendation
            if v.type == "Heavy Truck":
                recommended_ev = "Volvo VNR Electric"
            elif v.type == "Delivery Van":
                recommended_ev = "Ford E-Transit"
            elif v.type == "Forklift":
                recommended_ev = "Toyota Core Electric"
            else:
                recommended_ev = "Epiroc Scooptram (EV)"
                
            # Estimated TCO Delta
            # Diesel cost vs Electricity Cost
            diesel_cost = v.annual_utilization_km / v.fuel_efficiency_km_l * 1.2 # $1.2/l
            electricity_cost = v.annual_utilization_km * 0.8 * 0.15 # 0.8 kWh/km * $0.15/kWh (average for commercial)
            tco_delta = diesel_cost - electricity_cost
            
            # CO2 Saved
            co2_saved = (v.annual_utilization_km * v.emission_factor_g_co2_km) / 1000000 # tonnes

            v_dict = {
                "id": v.id,
                "type": v.type,
                "daily_km": v.daily_km,
                "payload_tons": v.payload_tons,
                "dwell_time_hours": v.dwell_time_hours,
                "route_type": v.route_type,
                "fuel_efficiency_km_l": v.fuel_efficiency_km_l,
                "annual_utilization_km": v.annual_utilization_km,
                "emission_factor_g_co2_km": v.emission_factor_g_co2_km,
                "readiness_score": readiness_score,
                "recommended_ev": recommended_ev,
                "tco_delta": round(tco_delta, 2),
                "co2_saved": round(co2_saved, 2)
            }
            results.append(v_dict)
            
        # Sort by readiness score descending
        results.sort(key=lambda x: x["readiness_score"], reverse=True)
        return results
