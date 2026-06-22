from pydantic import BaseModel, Field
from typing import List, Optional

class TelemetryPoint(BaseModel):
    timestamp: str
    soc: float
    soh: float
    temperature: float
    voltage: float
    current: float
    cycle_count: int

    class Config:
        from_attributes = True

class VehicleResponse(BaseModel):
    id: str
    type: str
    status: str
    battery_capacity_kwh: float
    current_soc: float
    current_soh: float
    cycle_count: int
    temperature_c: float
    voltage_v: float
    current_a: float
    has_thermal_anomaly: bool
    next_maintenance_date: Optional[str] = None
    rul_days: int
    health_score: int
    telemetry_history: Optional[List[TelemetryPoint]] = []

    class Config:
        from_attributes = True

class ICEVehicleResponse(BaseModel):
    id: str
    type: str
    daily_km: float
    payload_tons: float
    dwell_time_hours: float
    route_type: str
    fuel_efficiency_km_l: float
    annual_utilization_km: float
    emission_factor_g_co2_km: float
    readiness_score: Optional[int] = None
    recommended_ev: Optional[str] = None
    tco_delta: Optional[float] = None
    co2_saved: Optional[float] = None

    class Config:
        from_attributes = True

class SupplierResponse(BaseModel):
    id: str
    name: str
    tier: int
    material: str
    location: str
    risk_score: float
    geopolitical_risk: float
    concentration_risk: float
    quality_deviation: float
    status: str

    class Config:
        from_attributes = True

class SupplierFlowResponse(BaseModel):
    source_id: str
    target_id: str
    material: str
    volume_tpa: float

    class Config:
        from_attributes = True

class SupplyChainGraphResponse(BaseModel):
    nodes: List[SupplierResponse]
    edges: List[SupplierFlowResponse]

class CopilotRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)
    session_id: str = Field(..., pattern=r'^[a-zA-Z0-9\-]{8,64}$')

class CopilotResponse(BaseModel):
    answer: str
    citations: List[str] = []
