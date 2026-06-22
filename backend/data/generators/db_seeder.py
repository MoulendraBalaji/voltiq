import logging
from backend.core.database import SessionLocal, engine, Base
from backend.api.models.models import Vehicle, TelemetryHistory, ICEVehicle, Supplier, SupplierFlow
from backend.data.generators.bms_generator import generate_fleet_telemetry
from backend.data.generators.ice_fleet_generator import generate_ice_fleet
from backend.data.generators.supplier_generator import generate_supplier_graph

logger = logging.getLogger("voltiq.seeder")

def seed_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Vehicle).first():
            logger.info("Database already seeded. Skipping.")
            return

        logger.info("Seeding EV Fleet and Telemetry...")
        ev_assets = generate_fleet_telemetry(n_assets=20, n_cycles=100) # Use 100 cycles to limit DB size for demo
        
        for asset_data in ev_assets:
            telemetry_data = asset_data.pop("telemetry")
            asset_id = asset_data.pop("asset_id")
            vehicle = Vehicle(id=asset_id, **asset_data)
            db.add(vehicle)
            db.flush() # get vehicle id

            for tel in telemetry_data:
                db.add(TelemetryHistory(vehicle_id=vehicle.id, **tel))

        logger.info("Seeding ICE Fleet...")
        ice_fleet = generate_ice_fleet(n_vehicles=30)
        for ice_data in ice_fleet:
            db.add(ICEVehicle(**ice_data))

        logger.info("Seeding Supplier Graph...")
        graph = generate_supplier_graph()
        for node in graph["nodes"]:
            db.add(Supplier(**node))
        
        db.flush()

        for edge in graph["edges"]:
            db.add(SupplierFlow(**edge))

        db.commit()
        logger.info("Database seeding complete!")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_database()
