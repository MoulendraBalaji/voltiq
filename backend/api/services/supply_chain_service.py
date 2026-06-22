from sqlalchemy.orm import Session
from backend.api.models.models import Supplier, SupplierFlow

class SupplyChainService:
    def __init__(self, db: Session):
        self.db = db

    def get_graph(self):
        """
        Retrieves the supply chain graph nodes and edges.
        """
        nodes = self.db.query(Supplier).all()
        edges = self.db.query(SupplierFlow).all()
        return {"nodes": nodes, "edges": edges}
