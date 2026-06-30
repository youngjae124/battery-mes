from app.core.config import settings
from app.schemas.analysis import SpcAnalysisRequest, SpcAnalysisResponse
from app.utils.statistics import calculate_standard_deviation, to_numpy_array


class SpcAnalysisService:
    def analyze(self, request: SpcAnalysisRequest) -> SpcAnalysisResponse:
        numeric_values = to_numpy_array(request.values)
        average = float(numeric_values.mean())
        maximum = float(numeric_values.max())
        minimum = float(numeric_values.min())
        standard_deviation = calculate_standard_deviation(numeric_values)
        process_status = "WARNING" if standard_deviation > settings.spc_warning_stddev else "NORMAL"

        return SpcAnalysisResponse(
            sample_count=int(numeric_values.size),
            average=round(average, 4),
            max=round(maximum, 4),
            min=round(minimum, 4),
            standard_deviation=round(standard_deviation, 4),
            process_status=process_status,
        )