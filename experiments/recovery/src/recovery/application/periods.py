"""The period check: (a + b)^m mod p read through Gaussian periods, of rank gcd(m, p − 1),
filled by model M from the training splits of `grok-simple.py`. These are the powers of a + b
that the training experiment runs: `sum-square`, `sum-cube`, `sum-pow16`, `sum-pow48` and the
six of `RECOVERY` in its `application/runs.py`."""

from collections.abc import Iterator, Sequence
from dataclasses import dataclass

from recovery.application.additive import TOL, measured
from recovery.application.ports import Solver
from recovery.domain.residues import period_readout, period_table, roots_of_unity
from recovery.domain.splits import training_pattern


@dataclass(frozen=True)
class PeriodFill:
    m: int
    seed: int
    #: d = gcd(m, p − 1), the rank of the table.
    rank: int
    #: ‖X − K‖/‖K‖ on the hidden cells.
    error: float
    #: The share of hidden cells where the value of ρ nearest X_ij is ρ((i + j)^m).
    decoded: float
    #: ‖X‖_S1 − ‖K‖_S1: below 0, M does not recover K.
    gap: float
    steps: int


def period_check(solver: Solver, p: int, powers: Sequence[int], cap: int) -> Iterator[PeriodFill]:
    for m in powers:
        readout, table = period_readout(p, m), period_table(p, m)
        norm = solver.nuclear_norm(table)
        for seed in (7, 11):
            pattern = training_pattern(p, seed)
            fill = next(solver.fill(table, pattern, [cap], TOL))
            hidden = [(a, b) for a in range(p) for b in range(p) if not pattern[a][b]]
            right = sum(min(readout, key=lambda v: abs(fill.matrix[a][b] - readout[v])) == pow(a + b, m, p)
                        for a, b in hidden)
            yield PeriodFill(m, seed, len(roots_of_unity(p, m)), measured(fill, table, pattern).error,
                             right / len(hidden), fill.nuclear - norm, fill.steps)
