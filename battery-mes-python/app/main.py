from fastapi import FastAPI

from app.routers.analysis import router as analysis_router
from app.routers.health import router as health_router

app = FastAPI(
    title="Battery MES Python Analysis Service",
    version="0.1.0",
    description="Secondary battery MES analysis microservice for SPC and future ML expansion.",
)

app.include_router(health_router)
app.include_router(analysis_router)