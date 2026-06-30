from fastapi import APIRouter

from app.schemas.analysis import SpcAnalysisRequest, SpcAnalysisResponse
from app.services.spc_service import SpcAnalysisService

router = APIRouter(prefix="/analysis", tags=["analysis"])
spc_analysis_service = SpcAnalysisService()


@router.post("/spc", response_model=SpcAnalysisResponse)
def analyze_spc(request: SpcAnalysisRequest) -> SpcAnalysisResponse:
    return spc_analysis_service.analyze(request)