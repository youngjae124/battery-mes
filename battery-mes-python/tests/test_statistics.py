import numpy as np
import pytest

from app.utils.statistics import calculate_process_capability, calculate_standard_deviation, to_numpy_array


class TestCalculateStandardDeviation:

    def test_identical_values_returns_zero(self):
        arr = to_numpy_array([10.0, 10.0, 10.0])
        assert calculate_standard_deviation(arr) == 0.0

    def test_single_value_returns_zero(self):
        arr = to_numpy_array([5.0])
        assert calculate_standard_deviation(arr) == 0.0

    def test_known_population_stddev(self):
        # [2,4,4,4,5,5,7,9] mean=5, variance=4, std=2.0 (ddof=0)
        arr = to_numpy_array([2, 4, 4, 4, 5, 5, 7, 9])
        assert calculate_standard_deviation(arr) == pytest.approx(2.0, abs=1e-9)

    def test_two_values(self):
        arr = to_numpy_array([0.0, 2.0])
        # mean=1.0, variance=((0-1)^2+(2-1)^2)/2=1.0, std=1.0
        assert calculate_standard_deviation(arr) == pytest.approx(1.0, abs=1e-9)

    def test_returns_float(self):
        arr = to_numpy_array([1.0, 2.0, 3.0])
        result = calculate_standard_deviation(arr)
        assert isinstance(result, float)


class TestCalculateProcessCapability:

    def test_returns_none_when_usl_is_none(self):
        cp, cpk = calculate_process_capability(None, 4.0, 7.0, 1.0)
        assert cp is None
        assert cpk is None

    def test_returns_none_when_lsl_is_none(self):
        cp, cpk = calculate_process_capability(10.0, None, 7.0, 1.0)
        assert cp is None
        assert cpk is None

    def test_returns_none_when_usl_equals_lsl(self):
        cp, cpk = calculate_process_capability(10.0, 10.0, 10.0, 1.0)
        assert cp is None
        assert cpk is None

    def test_returns_none_when_usl_less_than_lsl(self):
        cp, cpk = calculate_process_capability(4.0, 10.0, 7.0, 1.0)
        assert cp is None
        assert cpk is None

    def test_returns_none_when_stddev_is_zero(self):
        cp, cpk = calculate_process_capability(10.0, 4.0, 7.0, 0.0)
        assert cp is None
        assert cpk is None

    def test_symmetric_range_returns_equal_cp_cpk(self):
        # usl=10, lsl=4, mean=7, std=1.0
        # cp = (10-4)/(6*1) = 1.0
        # cpu = (10-7)/(3*1) = 1.0, cpl = (7-4)/(3*1) = 1.0 → cpk = 1.0
        cp, cpk = calculate_process_capability(10.0, 4.0, 7.0, 1.0)
        assert cp == pytest.approx(1.0, abs=1e-4)
        assert cpk == pytest.approx(1.0, abs=1e-4)

    def test_asymmetric_range_cpk_is_smaller(self):
        # usl=85, lsl=75, mean=81, std=1.0
        # cp = 10/6 ≈ 1.6667
        # cpu = (85-81)/3 = 1.3333, cpl = (81-75)/3 = 2.0 → cpk = 1.3333
        cp, cpk = calculate_process_capability(85.0, 75.0, 81.0, 1.0)
        assert cp == pytest.approx(round(10 / 6, 4), abs=1e-4)
        assert cpk == pytest.approx(round(4 / 3, 4), abs=1e-4)
        assert cpk < cp

    def test_result_is_rounded_to_4_decimals(self):
        cp, cpk = calculate_process_capability(10.0, 4.0, 7.0, 1.0)
        # 소수점 4자리 이하 값이 없어야 함
        assert cp == round(cp, 4)
        assert cpk == round(cpk, 4)
