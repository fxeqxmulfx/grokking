"""The interval check: [a + b mod p < (p − 1)/2], the training experiment's `sum-interval`, read
as 0 and 1, filled by model M from the training splits of `grok-simple.py`, with its wrong hidden
cells counted along each sum a + b."""

from collections import Counter
from collections.abc import Iterator
from dataclasses import dataclass

from recovery.application.additive import TOL
from recovery.application.ports import Solver
from recovery.domain.residues import interval_table
from recovery.domain.splits import training_pattern


@dataclass(frozen=True)
class IntervalFill:
    seed: int
    hidden: int
    #: The wrong hidden cells on each sum c = a + b mod p that has one: those where the value of
    #: {0, 1} nearest X_ab is not [c < (p − 1)/2].
    wrong: dict[int, int]
    #: ‖X‖_S1 − ‖K‖_S1: below 0, M does not recover K.
    gap: float
    steps: int


def interval_check(solver: Solver, p: int, cap: int) -> Iterator[IntervalFill]:
    table = interval_table(p)
    norm = solver.nuclear_norm(table)
    for seed in (7, 11):
        pattern = training_pattern(p, seed)
        fill = next(solver.fill(table, pattern, [cap], TOL))
        hidden = [(a, b) for a in range(p) for b in range(p) if not pattern[a][b]]
        wrong = Counter((a + b) % p for a, b in hidden
                        if min((0, 1), key=lambda v: abs(fill.matrix[a][b] - v)) != table[a][b].real)
        yield IntervalFill(seed, len(hidden), dict(wrong), fill.nuclear - norm, fill.steps)
