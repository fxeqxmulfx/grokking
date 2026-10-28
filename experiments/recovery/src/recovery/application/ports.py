"""What the experiments need from outside: a solver of model M, and random numbers."""

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Protocol

from recovery.domain.patterns import Pattern


@dataclass(frozen=True)
class Completion:
    """Where the solver of model M stands on one pattern of K = a bᵀ: the nuclear norm of its
    completion X, and three sizes of X - K on the hidden cells."""

    nuclear: float
    #: ‖X - K‖ on the hidden cells over the square root of their number (at least 1).
    error_rms: float
    #: ‖X - K‖ on the hidden cells over ‖K‖.
    error_of_table: float
    #: ‖X - K‖ on the hidden cells over ‖K‖ on them.
    error_of_hidden: float


class Run(Protocol):
    """Model M being solved on a batch of patterns of one table."""

    def advance(self, steps: int) -> None:
        """Takes `steps` more steps on every pattern."""
        ...

    def measure(self) -> list[Completion]:
        """Where every pattern stands, in the order of the batch."""
        ...

    def keep(self, indices: Sequence[int]) -> None:
        """Drops every pattern but these, which keep their state, in this order."""
        ...


class Solver(Protocol):
    def start(self, patterns: Sequence[Pattern], a: Sequence[complex], b: Sequence[complex]) -> Run:
        """Model M, min ‖X‖_S1 with X = a bᵀ on the kept cells, on each pattern."""
        ...


class Draws(Protocol):
    def uniform(self, count: int) -> list[float]:
        """The next `count` numbers of one seeded stream, uniform in [0, 1)."""
        ...
