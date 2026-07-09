from typing import List, Optional

from pydantic import BaseModel, Field


class SpcAnalysisRequest(BaseModel):
    values: List[float] = Field(..., min_length=1, description="Numeric values for SPC analysis")
    usl: Optional[float] = Field(None, description="Upper specification limit for Cp/Cpk")
    lsl: Optional[float] = Field(None, description="Lower specification limit for Cp/Cpk")


class SpcAnalysisResponse(BaseModel):
    sample_count: int
    average: float
    max: float
    min: float
    standard_deviation: float
    process_status: str
    cp: Optional[float] = None
    cpk: Optional[float] = None


# ── 보고서 자동 요약 ────────────────────────────────────────────────────────────

class ProcessBreakdownItem(BaseModel):
    processType: str
    orderCount: int
    doneCount: int
    targetQty: int
    actualQty: int
    achievementRate: float


class ReportQualityData(BaseModel):
    totalInspections: int
    passCount: int
    failCount: int
    passRate: float
    totalDefects: int
    criticalDefectCount: int
    majorDefectCount: int
    minorDefectCount: int
    gradeACount: int
    gradeBCount: int
    gradeCCount: int


class ReportProductionData(BaseModel):
    totalWorkOrders: int
    doneCount: int
    achievementRate: float
    totalTargetQty: int
    totalActualQty: int
    processBreakdown: List[ProcessBreakdownItem]


class ReportSummaryRequest(BaseModel):
    startDate: str
    endDate: str
    quality: ReportQualityData
    production: ReportProductionData


class ReportSummaryResponse(BaseModel):
    summary: str


# ── 불량 원인 분석 ─────────────────────────────────────────────────────────────

class DefectData(BaseModel):
    severity: str
    defectCode: str
    description: Optional[str] = None
    category: Optional[str] = None


class DefectInspectionData(BaseModel):
    processType: str
    inspectionItem: str
    specMin: Optional[float] = None
    specMax: Optional[float] = None
    measuredValue: Optional[float] = None
    result: str


class DefectCauseRequest(BaseModel):
    defect: DefectData
    inspection: DefectInspectionData


class DefectCauseResponse(BaseModel):
    analysis: str