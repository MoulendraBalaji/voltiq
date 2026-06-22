import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any

def generate_fleet_telemetry(n_assets: int = 20, n_cycles: int = 500) -> List[Dict[str, Any]]:
    """
    Generate realistic battery degradation curves with noise for EV fleet.
    Returns a list of asset dictionaries, each containing its telemetry history.
    """
    assets = []
    base_time = datetime.now() - timedelta(days=n_cycles)

    for i in range(n_assets):
        # Capacity fade: ~20% over 1000 cycles with Gaussian noise
        cycles = np.arange(n_cycles)
        soh_curve = 100 - (cycles / 1000) * 20 + np.random.normal(0, 0.3, n_cycles)
        
        # Random thermal anomaly in 2/20 assets
        has_anomaly = i < 2
        if has_anomaly:
            # Introduce a sharp drop in SoH due to a simulated thermal event
            anomaly_start = np.random.randint(n_cycles // 2, max(n_cycles // 2 + 1, n_cycles - 50))
            soh_curve[anomaly_start:] -= np.random.uniform(5, 10)
        
        soh_history = soh_curve.clip(0, 100).tolist()
        current_soh = float(soh_history[-1])
        
        telemetry_history = []
        for cycle in range(n_cycles):
            # Calculate metrics per cycle
            # Simulate daily charging (SOC drops during day, charges up)
            # Just capture the state at end of charge/discharge cycle
            temp_base = 25.0
            if has_anomaly and cycle >= anomaly_start:
                temp_base += np.random.uniform(10, 25) # Thermal runaway signature
            
            telemetry_history.append({
                "timestamp": (base_time + timedelta(days=cycle)).isoformat(),
                "soc": float(np.random.uniform(15, 100)), # Random SOC when logged
                "soh": float(soh_history[cycle]),
                "temperature": float(np.random.normal(temp_base, 2.0)),
                "voltage": float(np.random.normal(400, 5)), # Nominal 400V
                "current": float(np.random.normal(50, 10)), # Operating current
                "cycle_count": cycle + 1
            })
            
        assets.append({
            "asset_id": f"EV-{i+1:03d}",
            "type": np.random.choice(["Heavy Truck", "Mining Loader", "Forklift", "Delivery Van"]),
            "status": np.random.choice(["Active", "Charging", "Maintenance"], p=[0.7, 0.2, 0.1]),
            "battery_capacity_kwh": float(np.random.choice([100.0, 250.0, 500.0])),
            "current_soc": telemetry_history[-1]["soc"],
            "current_soh": current_soh,
            "cycle_count": n_cycles,
            "temperature_c": telemetry_history[-1]["temperature"],
            "voltage_v": telemetry_history[-1]["voltage"],
            "current_a": telemetry_history[-1]["current"],
            "has_thermal_anomaly": has_anomaly,
            "telemetry": telemetry_history
        })
        
    return assets
