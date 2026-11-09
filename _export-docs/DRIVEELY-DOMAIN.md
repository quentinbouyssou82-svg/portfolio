from collections.abc import Callable
import functools
from typing import Literal

import numpy as np
from numpy.typing import ArrayLike

def window_hanning(x: ArrayLike) -> ArrayLike: ...
def window_none(x: ArrayLike) -> ArrayLike: ...
def detrend(
    x: ArrayLike,
    key: Literal["default", "constant", "mean", "linear", "none"]
    | Callable[[ArrayLike, int | None], ArrayLike]
    | None = ...,
    axis: int | None = ...,
) -> ArrayLike: ...
def detrend_mean(x: ArrayLike, axis: int | None = ...) -> ArrayLike: ...
def detrend_none(x: ArrayLike, axis: int | None = ...) -> ArrayLike: ...
def detrend_linear(y: ArrayLike) -> ArrayLike: ...
def psd(
    x: ArrayLike,
    NFFT: int | None = ...,
    Fs: float | None = ...,
    detrend: Literal["none", "mean", "linear"]
    | Callable[[ArrayLike, int | None], ArrayLike]
    | None = ...,
    window: Callable[[ArrayLike], ArrayLike] | ArrayLike | None = ...,
    noverlap: int | None = ...,
    pad_to: int | None = ...,
    sides: Literal["default", "onesided", "twosided"] | None = ...,
    scale_by_freq: bool | None = ...,
) -> tuple[ArrayLike, ArrayLike]: ...
def csd(
    x: ArrayLike,
    y: ArrayLike | None,
    NFFT: int | None = ...,
    Fs: float | 