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