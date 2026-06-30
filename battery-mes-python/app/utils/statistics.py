from typing import Iterable

import numpy as np


def to_numpy_array(values: Iterable[float]) -> np.ndarray:
    return np.array(list(values), dtype=float)


def calculate_standard_deviation(values: np.ndarray) -> float:
    return float(np.std(values, ddof=0))