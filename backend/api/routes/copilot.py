from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from backend.core.database import get_db
from backend.api.schemas.schemas import CopilotRequest
from backend.api.services.copilot_service import CopilotService

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("")
@limiter.limit("10/minute")
async def copilot_query(request: Request, payload: CopilotRequest, db: Session = Depends(get_db)):
    """Conversational AI endpoint with SSE streaming."""
    service = CopilotService(db)
    return StreamingResponse(
        service.stream_response(payload.query, session_history=[]),
        media_type="text/event-stream"
    )
