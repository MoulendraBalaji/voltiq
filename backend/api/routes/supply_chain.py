from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.api.schemas.schemas import SupplyChainGraphResponse
from backend.api.services.supply_chain_service import SupplyChainService

router = APIRouter()

@router.get("", response_model=SupplyChainGraphResponse)
def get_supply_chain_graph(db: Session = Depends(get_db)):
    """Get multi-tier supplier graph with risk metrics."""
    service = SupplyChainService(db)
    return service.get_graph()
