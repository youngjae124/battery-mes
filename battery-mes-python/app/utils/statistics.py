from typing import Iterable, Optional, Tuple

import numpy as np


def to_numpy_array(values: Iterable[float]) -> np.ndarray:
    return np.array(list(values), dtype=float)


def calculate_standard_deviation(values: np.ndarray) -> float:
    return float(np.std(values, ddof=0))


def calculate_process_capability(
    usl: Optional[float],
    lsl: Optional[float],
    mean: float,
    standard_deviation: float,
) -> Tuple[Optional[float], Optional[float]]:
    if usl is None or lsl is None or usl <= lsl or standard_deviation <= 0:
        return None, None

    cp = (usl - lsl) / (6 * standard_deviation)
    cpu = (usl - mean) / (3 * standard_deviation)
    cpl = (mean - lsl) / (3 * standard_deviation)
    cpk = min(cpu, cpl)

    return round(cp, 4), round(cpk, 4)