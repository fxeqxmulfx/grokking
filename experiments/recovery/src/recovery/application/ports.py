"""What the experiments need from outside: a solver of model M, the certificates of
Theorem D, and random numbers."""

from collections.abc import Iterator, Sequence
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


@dataclass(frozen=True)
class Fill:
    """Where the solver of model M stopped on one square table: its completion Z, which agrees
    with the table on the kept cells, the nuclear norm of Z, the steps taken, and the last two
    residuals ‖X − Z‖ and ‖Z − Z_before‖ (Frobenius)."""

    matrix: list[list[complex]]
    nuclear: float
    steps: int
    residuals: tuple[float, float]


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

    def start_tables(self, pattern: Pattern, tables: Sequence[tuple[Sequence[complex], Sequence[complex]]]) -> Run:
        """Model M on one pattern of each table a bᵀ, all of the same shape, in this order."""
        ...

    def fill(self, table: Sequence[Sequence[complex]], pattern: Pattern, checkpoints: Sequence[int],
             tol: float) -> Iterator[Fill]:
        """Model M on one square table: where it stands at each checkpoint, a number of steps,
        until both residuals fall below `tol`; then once more, there, and no further."""
        ...

    def nuclear_norm(self, table: Sequence[Sequence[complex]]) -> float:
        ...


class Certificates(Protocol):
    """The certificates of Theorem D, item 2: Y vanishing off a square pattern with unit row and
    column sums; ‖Y − J/N‖_op < 1 shows that model M recovers J, hence every table of modulus-one
    entries a bᵀ (item 4), from a rigid pattern."""

    def least_squares(self, pattern: Pattern) -> tuple[float, float]:
        """‖Y − J/N‖_op for the Y of least Frobenius norm, Y_ij = u_i + v_j on the kept cells with
        (u, v) the least-squares solution of the 2N sum equations, and the largest residual of
        those equations: not 0 when no such Y exists."""
        ...

    def best(self, pattern: Pattern, steps: int) -> tuple[float, float]:
        """The least ‖Y − J/N‖_op that projected subgradient descent finds in `steps` steps from
        the least-squares Y, and the largest violation of the constraints at the end."""
        ...

    def operator_norm(self, matrix: Sequence[Sequence[complex]]) -> float:
        ...


class Draws(Protocol):
    def uniform(self, count: int) -> list[float]:
        """The next `count` numbers of one seeded stream, uniform in [0, 1)."""
        ...

    def permutation(self, count: int) -> list[int]:
        """The next uniform permutation of range(count) from the same stream."""
        ...
