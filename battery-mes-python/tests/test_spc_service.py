import pytest

from app.schemas.analysis import SpcAnalysisRequest
from app.services.spc_service import SpcAnalysisService


@pytest.fixture
def service():
    return SpcAnalysisService()


class TestSpcAnalysisServiceAnalyze:

    def test_sample_count_matches_input_length(self, service):
        req = SpcAnalysisRequest(values=[10.0, 11.0, 12.0])
        result = service.analyze(req)
        assert result.sample_count == 3

    def test_average_is_correct(self, service):
        req = SpcAnalysisRequest(values=[10.0, 20.0, 30.0])
        result = service.analyze(req)
        assert result.average == pytest.approx(20.0, abs=1e-4)

    def test_max_and_min_are_correct(self, service):
        req = SpcAnalysisRequest(values=[5.0, 1.0, 3.0, 9.0, 2.0])
        result = service.analyze(req)
        assert result.max == pytest.approx(9.0, abs=1e-4)
        assert result.min == pytest.approx(1.0, abs=1e-4)

    def test_process_status_normal_when_stddev_within_threshold(self, service):
        # std([10.1,10.2,10.0,10.1,10.1], ddof=0) ≈ 0.063 ≤ 0.2 → NORMAL
        req = SpcAnalysisRequest(values=[10.1, 10.2, 10.0, 10.1, 10.1])
        result = service.analyze(req)
        assert result.process_status == "NORMAL"

    def test_process_status_warning_when_stddev_exceeds_threshold(self, service):
        # std([10.0,10.5,9.5,10.0,10.0], ddof=0) ≈ 0.316 > 0.2 → WARNING
        req = SpcAnalysisRequest(values=[10.0, 10.5, 9.5, 10.0, 10.0])
        result = service.analyze(req)
        assert result.process_status == "WARNING"

    def test_cp_cpk_are_none_when_usl_lsl_not_provided(self, service):
        req = SpcAnalysisRequest(values=[10.0, 10.1, 9.9])
        result = service.analyze(req)
        assert result.cp is None
        assert result.cpk is None

    def test_cp_cpk_are_computed_when_usl_lsl_provided(self, service):
        # values=[10.0]*5 → std=0.0 → cp/cpk=None (stddev=0)
        # 약간 분산이 있는 데이터를 사용
        req = SpcAnalysisRequest(values=[79.0, 80.0, 81.0, 80.0, 80.0],
                                 usl=85.0, lsl=75.0)
        result = service.analyze(req)
        assert result.cp is not None
        assert result.cpk is not None

    def test_standard_deviation_is_rounded_to_4_decimals(self, service):
        req = SpcAnalysisRequest(values=[1.0, 2.0, 3.0])
        result = service.analyze(req)
        assert result.standard_deviation == round(result.standard_deviation, 4)

    def test_average_is_rounded_to_4_decimals(self, service):
        req = SpcAnalysisRequest(values=[1.0, 2.0, 3.0])
        result = service.analyze(req)
        assert result.average == round(result.average, 4)

    def test_single_value_input(self, service):
        req = SpcAnalysisRequest(values=[42.0])
        result = service.analyze(req)
        assert result.sample_count == 1
        assert result.average == pytest.approx(42.0, abs=1e-4)
        assert result.max == pytest.approx(42.0, abs=1e-4)
        assert result.min == pytest.approx(42.0, abs=1e-4)
        assert result.standard_deviation == pytest.approx(0.0, abs=1e-9)
        assert result.process_status == "NORMAL"
