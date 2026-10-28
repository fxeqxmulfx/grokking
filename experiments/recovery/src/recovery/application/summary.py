"""A class of patterns, summed up by the ranges of its gaps and errors."""

from collections.abc import Sequence
from dataclasses import dataclass

#: An error below this counts as recovered.
RECOVERED = 1e-6


@dataclass(frozen=True)
class ClassSummary:
    name: str
    count: int
    #: The least and the greatest gap ‖X‖_S1 - ‖a‖ ‖b‖.
    gap: tuple[float, float]
    #: The least and the greatest error.
    error: tuple[float, float]
    #: How many patterns have an error below RECOVERED.
    recovered: int


def summarize(name: str, gaps: Sequence[float], errors: Sequence[float]) -> ClassSummary:
    return ClassSummary(
        name=name,
        count=len(gaps),
        gap=(min(gaps), max(gaps)),
        error=(min(errors), max(errors)),
        recovered=sum(e < RECOVERED for e in errors),
    )


def merge(name: str, parts: Sequence[ClassSummary]) -> ClassSummary:
    """One summary for the union of disjoint classes."""
    return ClassSummary(
        name=name,
        count=sum(p.count for p in parts),
        gap=(min(p.gap[0] for p in parts), max(p.gap[1] for p in parts)),
        error=(min(p.error[0] for p in parts), max(p.error[1] for p in parts)),
        recovered=sum(p.recovered for p in parts),
    )
