"""What the experiments need from outside: a solver of model M, the certificates of
Theorem D and of *Rank above one*, and random numbers."""

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

    def matrices(self) -> list[list[list[complex]]]:
        """The completion Z of every pattern, which agrees with its table on the kept cells."""
        ...

    def duals(self) -> list[list[list[complex]]]:
        """The dual Y of every pattern, which vanishes off its kept cells; where the solver has
        converged, Y is a contraction with tr(Yᴴ Z) = ‖Z‖_S1, the certificate of *Rank above
        one*, item 5.1, for Z."""
        ...


class Solver(Protocol):
    def start(self, patterns: Sequence[Pattern], a: Sequence[complex], b: Sequence[complex]) -> Run:
        """Model M, min ‖X‖_S1 with X = a bᵀ on the kept cells, on each pattern."""
        ...

    def start_tables(self, pattern: Pattern, tables: Sequence[tuple[Sequence[complex], Sequence[complex]]]) -> Run:
        """Model M on one pattern of each table a bᵀ, all of the same shape, in this order."""
        ...

    def start_matrices(self, patterns: Sequence[Pattern], tables: Sequence[Sequence[Sequence[complex]]]) -> Run:
        """Model M on each pattern of its own table, of any rank, all of the same shape, in this
        order."""
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


@dataclass(frozen=True)
class RankCertificate:
    """The certificate of *Rank above one*, item 1, for a table K of rank r and a pattern Ω:
    U, V from a singular value decomposition, and W with Uᴴ W = 0, W V = 0 and U Vᴴ + W
    vanishing off Ω. A ‖W‖_op below 1 gives item 1.2 with c = 1/‖W‖_op, when no nonzero
    U Aᴴ + B Vᴴ vanishes on Ω."""

    #: The least singular value of h ↦ h on Ω over the matrices h = U Aᴴ + B Vᴴ, taken with an
    #: orthonormal basis; 0 exactly when a nonzero one vanishes on Ω.
    injectivity: float
    #: ‖W‖_op for the W of least Frobenius norm, or None when no W exists.
    least_squares: float | None
    #: The least ‖W‖_op that projected subgradient descent finds from it, or None.
    best: float | None
    #: The largest violation of the equations for W at the end: above 1e-9, no W exists.
    violation: float


@dataclass(frozen=True)
class DualCheck:
    """*Rank above one*, item 5, on a solver's dual Y and completion Z for a table K of rank r
    and a pattern Ω: U, V from a singular value decomposition of K, and Ŷ = Y / max(1, ‖Y‖_op),
    a contraction that vanishes off Ω where Y does."""

    #: ‖Y‖_op.
    norm: float
    #: The largest |Y_ij| off Ω.
    off: float
    #: ‖K‖_S1 − Re tr(Ŷᴴ K): at least 0, and 0 exactly when Ŷ is item 5.1's certificate for K.
    #: Every X equal to K on Ω has ‖X‖_S1 ≥ ‖K‖_S1 − defect.
    defect: float
    #: ‖Ŷ V − U‖_F and ‖Ŷᴴ U − V‖_F, that is ‖W V‖_F and ‖Uᴴ W‖_F for W = Ŷ − U Vᴴ (item 5.2).
    right: float
    left: float
    #: ‖Ŷ − U Vᴴ‖_op (items 5.2 and 5.3).
    rest: float
    #: The largest |(U Vᴴ)_ij| off Ω: 0 exactly when W = 0 makes U Vᴴ + W vanish off Ω (item 5.4).
    polar_off: float
    #: ‖Π (Z − K) Π'‖_S1, Π = 1 − U Uᴴ, Π' = 1 − V Vᴴ, for item 1.1's bound on every W.
    spread: float


class RankCertificates(Protocol):
    def certificate(self, table: Sequence[Sequence[complex]], pattern: Pattern, rank: int,
                    steps: int) -> RankCertificate:
        """The certificate for `table`, of rank `rank`, from `pattern`; the descent takes `steps`
        steps, and runs only when no W of norm below 1 is known yet and h ↦ h on Ω is injective."""
        ...

    def dual(self, table: Sequence[Sequence[complex]], pattern: Pattern, rank: int,
             completion: Sequence[Sequence[complex]], dual: Sequence[Sequence[complex]]) -> DualCheck:
        """Item 5 on a solver's `completion` Z and `dual` Y for `table`, of rank `rank`, from
        `pattern`."""
        ...


class Draws(Protocol):
    def uniform(self, count: int) -> list[float]:
        """The next `count` numbers of one seeded stream, uniform in [0, 1)."""
        ...

    def permutation(self, count: int) -> list[int]:
        """The next uniform permutation of range(count) from the same stream."""
        ...
