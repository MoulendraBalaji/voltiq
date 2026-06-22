import random
from typing import Dict, List, Any

def generate_ice_fleet(n_vehicles: int = 30) -> List[Dict[str, Any]]:
    """
    Generate conventional ICE fleet data for electrification readiness scoring.
    """
    vehicles = []
    
    for i in range(n_vehicles):
        v_type = random.choice(["Heavy Truck", "Delivery Van", "Forklift", "Mining Loader"])
        
        # Base characteristics depending on type
        if v_type == "Heavy Truck":
            daily_km = random.uniform(150, 400)
            payload_tons = random.uniform(10, 40)
            route_type = random.choice(["Highway", "Intercity"])
            fuel_efficiency = random.uniform(2.5, 4.0) # km/l
        elif v_type == "Delivery Van":
            daily_km = random.uniform(50, 150)
            payload_tons = random.uniform(1, 5)
            route_type = "Urban"
            fuel_efficiency = random.uniform(8.0, 12.0)
        elif v_type == "Forklift":
            daily_km = random.uniform(10, 30) # mostly indoor, slow
            payload_tons = random.uniform(1, 3)
            route_type = "Warehouse"
            fuel_efficiency = random.uniform(1.5, 3.0) # equivalent km/l
        else: # Mining Loader
            daily_km = random.uniform(20, 80)
            payload_tons = random.uniform(20, 100)
            route_type = "Off-road"
            fuel_efficiency = random.uniform(1.0, 2.0)

        dwell_time = random.uniform(4.0, 14.0) # hours available for charging per day
        annual_utilization = daily_km * random.uniform(250, 300) # km/year

        vehicles.append({
            "id": f"ICE-{i+1:03d}",
            "type": v_type,
            "daily_km": float(daily_km),
            "payload_tons": float(payload_tons),
            "dwell_time_hours": float(dwell_time),
            "route_type": route_type,
            "fuel_efficiency_km_l": float(fuel_efficiency),
            "annual_utilization_km": float(annual_utilization),
            "emission_factor_g_co2_km": 268.0 # Standard diesel baseline
        })
        
    return vehicles
