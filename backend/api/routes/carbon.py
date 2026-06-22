from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.api.services.carbon_tracker import CarbonTrackerService

router = APIRouter()

@router.get("")
def get_carbon_intelligence(db: Session = Depends(get_db)):
    """Get Scope 1/3 emissions, fleet transition progress, and priority targets."""
    service = CarbonTrackerService(db)
    return service.get_carbon_intelligence()
