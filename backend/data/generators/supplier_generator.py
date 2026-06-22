import random
from typing import Dict, List, Any

GEOPOLITICAL_RISK = {
    "DRC": 0.85,
    "China": 0.55,
    "Indonesia": 0.40,
    "Chile": 0.25,
    "Australia": 0.10,
    "USA": 0.15,
    "South Korea": 0.20,
    "Japan": 0.15
}

def generate_supplier_graph() -> Dict[str, List[Any]]:
    """
    Generate a 3-tier supply chain graph for NMC battery cells.
    Returns a dict with 'nodes' and 'edges'.
    """
    nodes = []
    edges = []

    # Tier 1: Cell Manufacturers
    tier1_suppliers = [
        {"id": "SUP-T1-1", "name": "GlobalVolt Cells", "location": "USA", "material": "NMC Cells"},
        {"id": "SUP-T1-2", "name": "SinoEnergy Tech", "location": "China", "material": "LFP Cells"},
        {"id": "SUP-T1-3", "name": "K-Battery Co", "location": "South Korea", "material": "NMC Cells"}
    ]

    # Tier 2: Refiners and Precursors
    tier2_suppliers = [
        {"id": "SUP-T2-1", "name": "Dragon Refining", "location": "China", "material": "Lithium Carbonate"},
        {"id": "SUP-T2-2", "name": "Aussie Chem", "location": "Australia", "material": "Lithium Hydroxide"},
        {"id": "SUP-T2-3", "name": "SinoCobalt Ltd", "location": "China", "material": "Cobalt Sulfate"},
        {"id": "SUP-T2-4", "name": "IndoNickel Smelters", "location": "Indonesia", "material": "Nickel Sulfate"}
    ]

    # Tier 3: Miners
    tier3_suppliers = [
        {"id": "SUP-T3-1", "name": "Andes Lithium", "location": "Chile", "material": "Lithium Brine"},
        {"id": "SUP-T3-2", "name": "Outback Minerals", "location": "Australia", "material": "Spodumene"},
        {"id": "SUP-T3-3", "name": "Congo Resource Min", "location": "DRC", "material": "Cobalt Ore"},
        {"id": "SUP-T3-4", "name": "Nusantara Mining", "location": "Indonesia", "material": "Nickel Ore"}
    ]

    # Process all suppliers into nodes
    all_suppliers = tier1_suppliers + tier2_suppliers + tier3_suppliers
    for s in all_suppliers:
        geo_risk = GEOPOLITICAL_RISK.get(s["location"], 0.5)
        
        # Random quality deviation, spike it for one specific supplier to show in demo
        qual_dev = random.uniform(0.01, 0.05)
        if s["id"] == "SUP-T3-3":  # DRC Cobalt
            qual_dev = 0.25 # Huge quality deviation to trigger alert
            status = "Critical"
        else:
            status = "Active" if qual_dev < 0.1 else "Flagged"

        conc_risk = random.uniform(0.2, 0.8)
        # Compute total risk score (weighted avg)
        risk_score = min(1.0, (geo_risk * 0.4) + (conc_risk * 0.3) + (qual_dev * 2.0)) # Make qual dev heavily impact score
        if s["id"] == "SUP-T3-3":
            risk_score = 0.95 # Force it red

        node = {
            "id": s["id"],
            "name": s["name"],
            "tier": int(s["id"][5]), # extract tier number from ID
            "material": s["material"],
            "location": s["location"],
            "geopolitical_risk": geo_risk,
            "concentration_risk": conc_risk,
            "quality_deviation": qual_dev,
            "status": status,
            "risk_score": risk_score
        }
        nodes.append(node)

    # Edges T3 -> T2
    edges.extend([
        {"source_id": "SUP-T3-1", "target_id": "SUP-T2-1", "material": "Lithium Brine", "volume_tpa": 50000},
        {"source_id": "SUP-T3-2", "target_id": "SUP-T2-2", "material": "Spodumene", "volume_tpa": 120000},
        {"source_id": "SUP-T3-3", "target_id": "SUP-T2-3", "material": "Cobalt Ore", "volume_tpa": 8000},
        {"source_id": "SUP-T3-4", "target_id": "SUP-T2-4", "material": "Nickel Ore", "volume_tpa": 150000}
    ])

    # Edges T2 -> T1
    edges.extend([
        {"source_id": "SUP-T2-1", "target_id": "SUP-T1-2", "material": "Lithium Carbonate", "volume_tpa": 15000},
        {"source_id": "SUP-T2-2", "target_id": "SUP-T1-1", "material": "Lithium Hydroxide", "volume_tpa": 12000},
        {"source_id": "SUP-T2-2", "target_id": "SUP-T1-3", "material": "Lithium Hydroxide", "volume_tpa": 18000},
        {"source_id": "SUP-T2-3", "target_id": "SUP-T1-1", "material": "Cobalt Sulfate", "volume_tpa": 3000},
        {"source_id": "SUP-T2-3", "target_id": "SUP-T1-3", "material": "Cobalt Sulfate", "volume_tpa": 4000},
        {"source_id": "SUP-T2-4", "target_id": "SUP-T1-1", "material": "Nickel Sulfate", "volume_tpa": 20000},
        {"source_id": "SUP-T2-4", "target_id": "SUP-T1-3", "material": "Nickel Sulfate", "volume_tpa": 25000}
    ])

    return {"nodes": nodes, "edges": edges}
