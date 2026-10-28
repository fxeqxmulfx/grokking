"""The character check of `review/flat_spectrum.md`: the tables χ(ab) = χ(a) χ(b) and
χ(a + ab) = χ(a) χ(1 + b) of a faithful multiplicative character χ mod p, χ(0) = 0, filled by
model M from the training splits of `grok-simple.py`. Each is rank one with a zero row and a
zero column; with moduli one on the supports, Theorem G asks rigidity on the supports and a
bijection between them inside the pattern (`forall_isMinOn_vecMulVec_iff_equiv_support`).
Ported from `chi_check.py` of the first checks."""

import math
from collections.abc import Iterator
from dataclasses import dataclass

from recovery.application.additive import TOL
from recovery.application.ports import Solver
from recovery.domain.matchings import max_matching
from recovery.domain.patterns import rigid_on_supports
from recovery.domain.residues import discrete_log
from recovery.domain.splits import training_pattern


def character(p: int) -> list[complex]:
    """χ(x) = e^{2πi k/(p − 1)} for x = g^k, g the least primitive root; χ(0) = 0."""
    return [0j if k is None else complex(math.cos(2 * math.pi * k / (p - 1)), math.sin(2 * math.pi * k / (p - 1)))
            for k in discrete_log(p)]


@dataclass(frozen=True)
class CharacterFill:
    table: str
    seed: int
    rigid: bool
    #: A bijection between the support rows and the support columns inside the pattern.
    matched: bool
    #: ‖X − K‖/‖K‖ on the hidden cells.
    error: float
    #: The largest |X_ij| on the hidden cells of the zero row and the zero column.
    zero_lines: float
    #: The share of hidden cells where the value of χ nearest X_ij is χ of the right residue.
    decoded: float
    nuclear: float
    steps: int


def character_check(solver: Solver, p: int, cap: int) -> Iterator[CharacterFill]:
    chi = character(p)
    tables = {"chi(ab)": (chi, chi, lambda a, b: a * b % p),
              "chi(a + ab)": (chi, [chi[(1 + b) % p] for b in range(p)], lambda a, b: (a + a * b) % p)}
    for name, (u, v, task) in tables.items():
        table = [[x * y for y in v] for x in u]
        rows = [i for i, x in enumerate(u) if x != 0]
        cols = [j for j, y in enumerate(v) if y != 0]
        for seed in (7, 11):
            pattern = training_pattern(p, seed)
            inside = tuple(tuple(pattern[i][j] for j in cols) for i in rows)
            fill = next(solver.fill(table, pattern, [cap], TOL))
            hidden = [(i, j) for i in range(p) for j in range(p) if not pattern[i][j]]
            miss = math.sqrt(sum(abs(fill.matrix[i][j] - table[i][j]) ** 2 for i, j in hidden))
            whole = math.sqrt(sum(abs(table[i][j]) ** 2 for i, j in hidden))
            zero_lines = max((abs(fill.matrix[i][j]) for i, j in hidden if u[i] == 0 or v[j] == 0), default=0.0)
            right = sum(min(range(p), key=lambda r: abs(fill.matrix[i][j] - chi[r])) == task(i, j) for i, j in hidden)
            yield CharacterFill(name, seed, rigid_on_supports(pattern, [abs(x) ** 2 for x in u], [abs(y) ** 2 for y in v]),
                                len(rows) == len(cols) == max_matching(inside)[0], miss / whole, zero_lines,
                                right / len(hidden), fill.nuclear, fill.steps)
