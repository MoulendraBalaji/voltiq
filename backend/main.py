from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from backend.core.config import settings
from backend.api.routes import fleet, supply_chain, carbon, copilot
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("voltiq")

app = FastAPI(
    title="VoltIQ API",
    description="AI Intelligence Platform for Industrial EV Asset Management and Supply Chain Resilience",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Register routers
app.include_router(fleet.router, prefix="/api/fleet", tags=["Fleet APM"])
app.include_router(supply_chain.router, prefix="/api/supply-chain", tags=["Supply Chain"])
app.include_router(carbon.router, prefix="/api/carbon", tags=["Carbon Intelligence"])
app.include_router(copilot.router, prefix="/api/copilot", tags=["Copilot Agent"])

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "VoltIQ Backend"}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error occurred."})

if __name__ == "__main__":
    import uvicorn
    # Local dev runner
    uvicorn.run("backend.main:app", host=settings.host, port=settings.port, reload=True)
