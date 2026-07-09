from fastapi import APIRouter

from app.schemas.analysis import (
    DefectCauseRequest,
    DefectCauseResponse,
    DefectImageRequest,
    DefectImageResponse,
    ReportSummaryRequest,
    ReportSummaryResponse,
    SpcAnalysisRequest,
    SpcAnalysisResponse,
)
from app.services.defect_cause_service import DefectCauseService
from app.services.defect_image_service import DefectImageService
from app.services.report_summary_service import ReportSummaryService
from app.services.spc_service import SpcAnalysisService

router = APIRouter(prefix="/analysis", tags=["analysis"])

spc_analysis_service = SpcAnalysisService()
report_summary_service = ReportSummaryService()
defect_cause_service = DefectCauseService()
defect_image_service = DefectImageService()


@router.post("/spc", response_model=SpcAnalysisResponse)
def analyze_spc(request: SpcAnalysisRequest) -> SpcAnalysisResponse:
    return spc_analysis_service.analyze(request)


@router.post("/report-summary", response_model=ReportSummaryResponse)
def summarize_report(request: ReportSummaryRequest) -> ReportSummaryResponse:
    return report_summary_service.summarize(request)


@router.post("/defect-cause", response_model=DefectCauseResponse)
def analyze_defect_cause(request: DefectCauseRequest) -> DefectCauseResponse:
    return defect_cause_service.analyze(request)


@router.post("/defect-image", response_model=DefectImageResponse)
def analyze_defect_image(request: DefectImageRequest) -> DefectImageResponse:
    return defect_image_service.analyze(request)