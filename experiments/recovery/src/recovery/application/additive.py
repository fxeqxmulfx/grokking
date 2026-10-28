"""The checks on p x p tables at primes p, `review/flat_spectrum.md` (Theorem D and the section
"Patterns"): ψ(a + b) and ψ(a³ + a b) filled by model M from diagonals, the cross, random cells
and the training splits of `grok-simple.py`, with the certificates and the matchings of each
pattern. Ported from `complete.py`, `diagonals.py`, `patterns.py`, `matching.py`, `leaves.py`,
`certopt.py`, `longrun.py` and `cubic_split.py` of the first checks."""

import math
from collections.abc import Callable, Iterator, Sequence
from dataclasses import dataclass

from recovery.application.ports import Certificates, Draws, Fill, Solver
from recovery.domain.matchings import block_bound, elementary, leaves, max_matching
from recovery.domain.patterns import Pattern, cross, diagonals, rigid, without
from recovery.domain.residues import TASKS, values
from recovery.domain.splits import training_pattern

#: ADMM stops on one table when both residuals fall below this, as in the first checks.
TOL = 1e-9

#: The densities of the random patterns of the survey, three draws each.
DENSITIES = (0.02, 0.04, 0.06, 0.08, 0.12, 0.2, 0.3)

type Seeded = Callable[[int], Draws]


def psi_table(p: int, task: str) -> list[list[complex]]:
    """ψ(f(a, b)) = e^{2πi f(a, b)/p} for a task of TASKS."""
    return [[complex(math.cos(2 * math.pi * v / p), math.sin(2 * math.pi * v / p)) for v in row]
            for row in values(p, TASKS[task])]


def random_cells(draws: Draws, p: int, count: int) -> Pattern:
    """The first `count` cells of a uniform permutation of the p² cells, row-major."""
    kept = set(draws.permutation(p * p)[:count])
    return tuple(tuple(p * a + b in kept for b in range(p)) for a in range(p))


def random_density(draws: Draws, p: int, density: float) -> Pattern:
    """Every cell kept when its uniform number, drawn row-major, is below `density`."""
    u = draws.uniform(p * p)
    return tuple(tuple(u[p * a + b] < density for b in range(p)) for a in range(p))


@dataclass(frozen=True)
class Filled:
    """Model M on one pattern of one table: the error ‖X − K‖/‖K‖ and the size ‖X‖ of X,
    both on the hidden cells, and where ADMM stopped."""

    cells: int
    error: float
    hidden: float
    nuclear: float
    steps: int
    residuals: tuple[float, float]


def measured(fill: Fill, table: Sequence[Sequence[complex]], pattern: Pattern) -> Filled:
    cells = [(fill.matrix[i][j], table[i][j]) for i, row in enumerate(pattern) for j, kept in enumerate(row) if not kept]
    miss = math.sqrt(sum(abs(x - k) ** 2 for x, k in cells))
    return Filled(sum(map(sum, pattern)), miss / math.sqrt(sum(abs(k) ** 2 for _, k in cells)),
                  math.sqrt(sum(abs(x) ** 2 for x, _ in cells)), fill.nuclear, fill.steps, fill.residuals)


def filled(solver: Solver, table: Sequence[Sequence[complex]], pattern: Pattern, cap: int) -> Filled:
    return measured(next(solver.fill(table, pattern, [cap], TOL)), table, pattern)


def diagonal_certificate(certificates: Certificates, p: int, offsets: Sequence[int]) -> float:
    """‖Y − J/p‖_op for Y = (P_s₁ + P_s₂)/2, the certificate of Theorem D, item 3."""
    pattern = diagonals(p, offsets)
    return certificates.operator_norm([[0.5 * kept - 1 / p for kept in row] for row in pattern])


def theorem_d_patterns(p: int, seeded: Seeded) -> dict[str, Pattern]:
    """The patterns of the table of Theorem D's numerical check; the random ones share seed 0."""
    return {
        "two diagonals {0,1}": diagonals(p, [0, 1]),
        "two diagonals {0,3}": diagonals(p, [0, 3]),
        "one diagonal {0}": diagonals(p, [0]),
        "two diagonals minus a cell": without(diagonals(p, [0, 1]), 0, 1),
        "row 0 and column 0": cross(p),
        "random 2p cells": random_cells(seeded(0), p, 2 * p),
        "random 4p cells": random_cells(seeded(0), p, 4 * p),
        "random p^2/2 cells": random_cells(seeded(0), p, p * p // 2),
    }


def theorem_d(solver: Solver, seeded: Seeded, p: int, cap: int) -> Iterator[tuple[str, str, Filled, float]]:
    """Each task of TASKS on each pattern: its name, the pattern's, the fill and ‖K‖_S1."""
    for task in TASKS:
        table = psi_table(p, task)
        norm = solver.nuclear_norm(table)
        for name, pattern in theorem_d_patterns(p, seeded).items():
            yield task, name, filled(solver, table, pattern, cap), norm


def long_diagonals(solver: Solver, certificates: Certificates, p: int, cap: int) -> Iterator[tuple[str, float | None, Filled]]:
    """ψ(a + b) from the diagonals {0, 1}, {0, 5} and {3, (p − 1)/2}, with their certificates,
    and from the diagonal {0} alone."""
    table = psi_table(p, "a+b")
    for offsets in ([0, 1], [0, 5], [3, p // 2]):
        yield (f"two diagonals {{{offsets[0]},{offsets[1]}}}", diagonal_certificate(certificates, p, offsets),
               filled(solver, table, diagonals(p, offsets), cap))
    yield "one diagonal {0}", None, filled(solver, table, diagonals(p, [0]), cap)


def survey_patterns(p: int, seeded: Seeded) -> dict[str, Pattern]:
    """The patterns of the survey: random ones keep each cell with a probability, three draws
    each with seeds 1000 p, 1000 p + 1 and 1000 p + 2."""
    out = {"two diagonals {0,1}": diagonals(p, [0, 1]), "two diagonals minus a cell": without(diagonals(p, [0, 1]), 0, 1),
           "row 0 and column 0": cross(p), "training split, seed 7": training_pattern(p, 7),
           "training split, seed 11": training_pattern(p, 11)}
    for density in DENSITIES:
        for trial in range(3):
            out[f"random {density:.2f}, draw {trial}"] = random_density(seeded(1000 * p + trial), p, density)
    return out


@dataclass(frozen=True)
class Surveyed:
    name: str
    rigid: bool
    #: The size of a maximum matching; p when the pattern contains a permutation.
    matching: int
    elementary: bool
    block_bound: float
    #: Rows and columns with a single kept cell.
    leaves: tuple[int, int]
    #: ‖Y − J/p‖_op of the least-squares Y, None when no Y meets the sums (residual above 1e-9).
    certificate: float | None
    #: The best ‖Y − J/p‖_op found, for rigid patterns whose least-squares Y is not below 1.
    best: tuple[float, float] | None
    fill: Filled


def survey(solver: Solver, certificates: Certificates, seeded: Seeded, p: int, cap: int,
           best_steps: int) -> Iterator[Surveyed]:
    """ψ(a + b) on every pattern of the survey, with its structure and its certificates."""
    table = psi_table(p, "a+b")
    for name, pattern in survey_patterns(p, seeded).items():
        norm, residual = certificates.least_squares(pattern)
        certificate = norm if residual < 1e-9 else None
        best = None
        if rigid(pattern) and (certificate is None or certificate >= 1):
            best = certificates.best(pattern, best_steps)
        yield Surveyed(name, rigid(pattern), max_matching(pattern)[0], elementary(pattern), block_bound(pattern),
                       leaves(pattern), certificate, best, filled(solver, table, pattern, cap))


def long_runs(solver: Solver, seeded: Seeded, p: int, checkpoints: Sequence[int]) -> Iterator[tuple[str, Filled]]:
    """ψ(a + b) on the survey patterns between the two theorems: rigid, with a permutation, and
    not elementary. Each reported at every checkpoint, until ADMM stops."""
    table = psi_table(p, "a+b")
    for name, pattern in survey_patterns(p, seeded).items():
        if rigid(pattern) and max_matching(pattern)[0] == p and not elementary(pattern):
            for fill in solver.fill(table, pattern, checkpoints, TOL):
                yield name, measured(fill, table, pattern)


def cubic_splits(solver: Solver, p: int, cap: int) -> Iterator[tuple[int, Filled, float]]:
    """ψ(a³ + a b) on the two training splits: the seed, the fill and ‖K‖_S1."""
    table = psi_table(p, "a^3+ab")
    norm = solver.nuclear_norm(table)
    for seed in (7, 11):
        yield seed, filled(solver, table, training_pattern(p, seed), cap), norm
