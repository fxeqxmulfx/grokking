"""The peak κ of every task: the largest share of a table that one centered interaction mode
carries under a readout of modulus one.

κ(f) = max over ρ : Z/p → S¹ and unit centered g(a), h(b) of |Σ_{a,b} conj ρ(f(a, b)) g(a) h(b)|² / |D|,
the top squared singular value of the doubly centered kernel [conj ρ(f(a, b))] over the number
|D| of cells, for the best ρ. κ_ψ fixes ρ = ψ_r, the best additive character r ≠ 0.
"""

from collections.abc import Iterator

from training.application.ports import Peak, PeakSolver
from training.domain.tasks import BLIND, TASKS, table

#: Every task, and the blind variants that drop the answer's lowest bit.
ALL = tuple(TASKS) + tuple(f"{name}/blind" for name in BLIND)


def key(p: int, name: str) -> str:
    return f"{p}:{name}"


def seed_of(p: int) -> int:
    """The random starts of the tables of size p: the same for every task."""
    return 1000 + p


def peaks(solver: PeakSolver, names: tuple[str, ...], primes: tuple[int, ...],
          known: dict[str, Peak]) -> Iterator[tuple[str, Peak]]:
    """κ for every task and prime not in `known`, prime by prime."""
    for p in primes:
        for name in names:
            if key(p, name) not in known:
                yield key(p, name), solver.peak(table(name, p), p, seed_of(p))
