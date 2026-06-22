from backend.api.services.planner import ElectrificationPlannerService
from sqlalchemy.orm import Session
from backend.api.models.models import Vehicle

class CarbonTrackerService:
    def __init__(self, db: Session):
        self.db = db
        self.planner = ElectrificationPlannerService(db)

    def get_carbon_intelligence(self):
        """
        Tracks fleet electrification progress and identifies highest-impact next electrification candidates.
        """
        evs = self.db.query(Vehicle).all()
        
        # Get ICE vehicles and their CO2 saved potential
        ice_scores = self.planner.get_readiness_scores()
        
        # Calculate current scope 1 savings (from existing EVs)
        # Standard baseline 40 tonnes/year per replaced vehicle
        scope_1_saved = len(evs) * 40.0
        
        # Calculate scope 3 emissions from existing EVs (charging from grid)
        # Average grid emission factor impact
        scope_3_added = len(evs) * 15.0
        
        net_saved = scope_1_saved - scope_3_added
        
        # Target is 30% EV
        total_fleet = len(evs) + len(ice_scores)
        target_evs = int(total_fleet * 0.3)
        progress_pct = (len(evs) / target_evs) * 100 if target_evs > 0 else 100
        
        # Sort ICE vehicles by CO2 saved to find top candidates
        ice_scores.sort(key=lambda x: x["co2_saved"], reverse=True)
        top_candidates = ice_scores[:5]
        
        return {
            "current_ev_count": len(evs),
            "target_ev_count": target_evs,
            "progress_percent": round(min(100, progress_pct), 1),
            "scope_1_saved_tonnes": round(scope_1_saved, 1),
            "scope_3_added_tonnes": round(scope_3_added, 1),
            "net_co2_saved_tonnes": round(net_saved, 1),
            "top_candidates": top_candidates
        }
