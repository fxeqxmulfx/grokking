"""The rank check of `review/flat_spectrum.md`, *Rank above one*, in the transformer repository.

- `three_cells`: 2 x 2 tables from the cells other than (0, 1). Lean gives M's unique minimum,
  x* = conj(k₁₀) k₀₀ k₁₁ / max(|k₁₀|², |k₀₀ k₁₁|) at (0, 1), and recovery exactly when k₀₁ = x*
  (item 3); the solver's fill is compared with x*.
- `rank_check`: random N x N tables of rank r from random patterns, sorted into the classes that
  items 1 and 2 name: the kept cells where K is nonzero do not join some nonzero entry (item 2:
  never recovered); they do, but a nonzero U Aᴴ + B Vᴴ vanishes on Ω; no such matrix vanishes
  and a certificate below 1 exists (item 1.2: always recovered); no such matrix vanishes and no
  certificate below 1 was found.
"""

import math
from collections.abc import Iterator, Sequence
from dataclasses import dataclass

from recovery.application.ports import Draws, RankCertificate, RankCertificates, Solver
from recovery.application.summary import RECOVERED
from recovery.domain.patterns import Pattern
from recovery.domain.ranks import joins_every_entry, three_cell_fill

type Table = list[list[complex]]

#: The three cells of a 2 x 2 table other than (0, 1).
THREE_CELLS: Pattern = ((True, False), (True, True))

#: The examples of item 3, as in the Lean `example`s.
EXAMPLES: dict[str, Table] = {
    "[[2, 1], [1, 1]]": [[2, 1], [1, 1]],
    "[[2, 1], [1, -1]]": [[2, 1], [1, -1]],
    "[[2, 1], [2, 1]]": [[2, 1], [2, 1]],
    "[[1, 2], [1, 2]]": [[1, 2], [1, 2]],
    "[[1, 1], [1, -1]]": [[1, 1], [1, -1]],
}


def phase(draws: Draws) -> complex:
    (t,) = draws.uniform(1)
    return complex(math.cos(2 * math.pi * t), math.sin(2 * math.pi * t))


def entry(draws: Draws) -> complex:
    """A modulus uniform in [0.3, 2] times a uniform phase."""
    (r,) = draws.uniform(1)
    return (0.3 + 1.7 * r) * phase(draws)


def three_cell_tables(draws: Draws, count: int) -> dict[str, list[Table]]:
    """`count` 2 x 2 tables of each kind, drawn in turn."""
    kinds: dict[str, list[Table]] = {"random": [], "rank one": [], "rank two, k01 = x*": [], "moduli one": [],
                                     "moduli one, rank one": []}
    for _ in range(count):
        kinds["random"].append([[entry(draws) for _ in range(2)] for _ in range(2)])
        u, v = [entry(draws) for _ in range(2)], [entry(draws) for _ in range(2)]
        kinds["rank one"].append([[x * y for y in v] for x in u])
        # |c| > |b|² and k01 = conj(b) c / |c|, so that det K = c (1 − |b|²/|c|) ≠ 0.
        b, k00 = entry(draws), entry(draws)
        (r,) = draws.uniform(1)
        c = (abs(b) ** 2 + 0.1 + 2 * r) * phase(draws)
        kinds["rank two, k01 = x*"].append([[k00, b.conjugate() * c / abs(c)], [b, c / k00]])
        kinds["moduli one"].append([[phase(draws) for _ in range(2)] for _ in range(2)])
        alpha, beta = [phase(draws) for _ in range(2)], [phase(draws) for _ in range(2)]
        kinds["moduli one, rank one"].append([[x * y for y in beta] for x in alpha])
    return kinds


def frobenius(table: Sequence[Sequence[complex]]) -> float:
    return math.sqrt(sum(abs(x) ** 2 for row in table for x in row))


@dataclass(frozen=True)
class ThreeCells:
    name: str
    count: int
    #: How many have k01 = x* to 1e-12 ‖K‖, so that Lean says M recovers them.
    predicted: int
    #: How many the solver gives back: |Z01 − k01| below 1e-6 ‖K‖.
    recovered: int
    #: How many tables the two disagree on.
    disagree: int
    #: The largest |Z01 − x*| over ‖K‖ (Frobenius).
    off_fill: float
    #: The least and the greatest |det K| over ‖K‖².
    det: tuple[float, float]


def three_cells(solver: Solver, draws: Draws, count: int, steps: int) -> list[ThreeCells]:
    groups = three_cell_tables(draws, count) | {name: [table] for name, table in EXAMPLES.items()}
    tables = [[[complex(x) for x in row] for row in t] for ts in groups.values() for t in ts]
    run = solver.start_matrices([THREE_CELLS] * len(tables), tables)
    run.advance(steps)
    filled = iter(zip(tables, run.matrices()))
    out = []
    for name, ts in groups.items():
        predicted = recovered = disagree = 0
        off, dets = 0.0, []
        for k, z in (next(filled) for _ in ts):
            norm = frobenius(k)
            x = three_cell_fill(k[1][0], k[0][0] * k[1][1])
            right = abs(k[0][1] - x) < 1e-12 * norm
            back = abs(z[0][1] - k[0][1]) < RECOVERED * norm
            predicted += right
            recovered += back
            disagree += right != back
            off = max(off, abs(z[0][1] - x) / norm)
            dets.append(abs(k[0][0] * k[1][1] - k[0][1] * k[1][0]) / norm ** 2)
        out.append(ThreeCells(name, len(ts), predicted, recovered, disagree, off, (min(dets), max(dets))))
    return out


def low_rank(draws: Draws, size: int, rank: int, kind: str) -> Table:
    """`dense`: A Bᵀ with N x r factors of random entries. `blocks`: r diagonal blocks of nearly
    equal sizes, each a bᵀ of random entries, and zeros off them."""
    if kind == "dense":
        a = [[entry(draws) for _ in range(rank)] for _ in range(size)]
        b = [[entry(draws) for _ in range(rank)] for _ in range(size)]
        return [[sum(a[i][t] * b[j][t] for t in range(rank)) for j in range(size)] for i in range(size)]
    block = [t * rank // size for t in range(size)]
    a, b = [entry(draws) for _ in range(size)], [entry(draws) for _ in range(size)]
    return [[a[i] * b[j] if block[i] == block[j] else 0j for j in range(size)] for i in range(size)]


def random_pattern(draws: Draws, size: int) -> Pattern:
    """Each cell kept with one density uniform in [0.3, 0.95]; drawn again when full."""
    while True:
        (density,) = draws.uniform(1)
        density = 0.3 + 0.65 * density
        cells = draws.uniform(size * size)
        pattern = tuple(tuple(cells[size * i + j] < density for j in range(size)) for i in range(size))
        if not all(map(all, pattern)):
            return pattern


#: The classes of items 1 and 2, in the order they are tested.
RANK_CLASSES = ("not joined", "joined, not injective", "injective, certificate", "injective, none found")


@dataclass(frozen=True)
class RankCase:
    cells: int
    joins: bool
    certificate: RankCertificate
    #: ‖Z − K‖ on the hidden cells over ‖K‖ (Frobenius).
    error: float
    #: ‖Z‖_S1 − ‖K‖_S1.
    gap: float

    @property
    def kind(self) -> str:
        if not self.joins:
            return RANK_CLASSES[0]
        if self.certificate.injectivity <= 1e-9:
            return RANK_CLASSES[1]
        best = self.certificate.best
        return RANK_CLASSES[2] if best is not None and best < 1 else RANK_CLASSES[3]


def rank_check(solver: Solver, certificates: RankCertificates, draws: Draws, size: int, rank: int, kind: str,
               count: int, steps: int, best_steps: int) -> Iterator[RankCase]:
    tables = [low_rank(draws, size, rank, kind) for _ in range(count)]
    patterns = [random_pattern(draws, size) for _ in range(count)]
    run = solver.start_matrices(patterns, tables)
    run.advance(steps)
    for table, pattern, completion in zip(tables, patterns, run.measure()):
        yield RankCase(sum(map(sum, pattern)), joins_every_entry(pattern, table),
                       certificates.certificate(table, pattern, rank, best_steps),
                       completion.error_of_table, completion.nuclear - solver.nuclear_norm(table))
