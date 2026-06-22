from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.core.database import Base

class Vehicle(Base):
    """
    SQLAlchemy model representing an electric vehicle (EV) asset.
    """
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True)  # e.g., EV-001
    type = Column(String, nullable=False)  # e.g., Heavy Truck, Forklift, Mining Loader
    status = Column(String, default="Active")  # Active, Charging, Maintenance
    battery_capacity_kwh = Column(Float, nullable=False)
    current_soc = Column(Float, default=100.0)
    current_soh = Column(Float, default=100.0)
    cycle_count = Column(Integer, default=0)
    temperature_c = Column(Float, default=25.0)
    voltage_v = Column(Float, default=400.0)
    current_a = Column(Float, default=0.0)
    has_thermal_anomaly = Column(Boolean, default=False)
    next_maintenance_date = Column(String, nullable=True)
    rul_days = Column(Integer, default=365)
    health_score = Column(Integer, default=100)

    # Relationships
    telemetry_history = relationship("TelemetryHistory", back_populates="vehicle", cascade="all, delete-orphan")


class TelemetryHistory(Base):
    """
    SQLAlchemy model representing a battery management system (BMS) telemetry log entry.
    """
    __tablename__ = "telemetry_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(String, nullable=False)
    soc = Column(Float, nullable=False)
    soh = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    voltage = Column(Float, nullable=False)
    current = Column(Float, nullable=False)
    cycle_count = Column(Integer, nullable=False)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="telemetry_history")


class ICEVehicle(Base):
    """
    SQLAlchemy model representing conventional Internal Combustion Engine (ICE) fleet vehicles
    for electrification readiness and Scope 1 vs Scope 3 carbon tracking.
    """
    __tablename__ = "ice_vehicles"

    id = Column(String, primary_key=True, index=True)  # e.g., ICE-001
    type = Column(String, nullable=False)  # e.g., Heavy Truck, Delivery Van, Forklift
    daily_km = Column(Float, nullable=False)
    payload_tons = Column(Float, nullable=False)
    dwell_time_hours = Column(Float, default=4.0)  # Charging window at depot
    route_type = Column(String, nullable=False)  # Urban, Highway, Off-road
    fuel_efficiency_km_l = Column(Float, nullable=False)
    annual_utilization_km = Column(Float, nullable=False)
    emission_factor_g_co2_km = Column(Float, default=268.0)  # default for standard diesel vehicles


class Supplier(Base):
    """
    SQLAlchemy model representing a battery material supplier (Tier 1 to 3).
    """
    __tablename__ = "suppliers"

    id = Column(String, primary_key=True, index=True)  # e.g., SUP-001
    name = Column(String, nullable=False)
    tier = Column(Integer, nullable=False)  # 1, 2, or 3
    material = Column(String, nullable=False)  # Lithium, Cobalt, Nickel, Cells, etc.
    location = Column(String, nullable=False)  # DRC, China, Chile, Australia, Indonesia, etc.
    risk_score = Column(Float, default=0.0)  # Total aggregate risk
    geopolitical_risk = Column(Float, default=0.0)
    concentration_risk = Column(Float, default=0.0)
    quality_deviation = Column(Float, default=0.0)
    status = Column(String, default="Active")  # Active, Flagged, Critical


class SupplierFlow(Base):
    """
    SQLAlchemy model representing the logistics material flow edge between suppliers.
    """
    __tablename__ = "supplier_flows"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False)
    target_id = Column(String, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False)
    material = Column(String, nullable=False)
    volume_tpa = Column(Float, default=0.0)  # Tons Per Annum flow volume
