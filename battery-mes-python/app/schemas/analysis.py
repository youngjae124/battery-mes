from typing import List

from pydantic import BaseModel, Field


class SpcAnalysisRequest(BaseModel):
    values: List[float] = Field(..., min_length=1, description="Numeric values for SPC analysis")


class SpcAnalysisResponse(BaseModel):
    sample_count: int
    average: float
    max: float
    min: float
    standard_deviation: float
    process_status: str