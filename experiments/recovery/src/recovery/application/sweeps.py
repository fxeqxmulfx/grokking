"""The checks: every pattern of a small table, sorted into the classes a theorem names, and
model M solved on each. Theorem E is `forall_isMinOn_vecMulVec_iff` and Theorem G
`forall_isMinOn_vecMulVec_iff_support` in the transformer repository."""

import math
from collections.abc import Callable, Iterator, Sequence
from dataclasses import dataclass

from recovery.application.ports import Completion, Draws, Solver
from recovery.application.summary import RECOVERED, ClassSummary, summarize
from recovery.domain.patterns import (
    Pattern, gale, gale_slack, hall_and_surplus, patterns, rigid, rigid_on_supports,
)


def solve(solver: Solver, batch: Sequence[Pattern], a: Sequence[complex], b: Sequence[complex],
          steps: int) -> list[Completion]:
    run = solver.start(batch, a, b)
    run.advance(steps)
    return run.measure()


def norm(v: Sequence[complex]) -> float:
    return math.sqrt(sum(abs(x) ** 2 for x in v))


def sweep(solver: Solver, groups: dict[str, list[Pattern]], a: Sequence[complex], b: Sequence[complex],
          steps: int, error: Callable[[Completion], float]) -> list[ClassSummary]:
    """Model M on every class, in the order of `groups`; the gap is ‖X‖_S1 - ‖a‖ ‖b‖."""
    out = []
    for name, batch in groups.items():
        if batch:
            done = solve(solver, batch, a, b, steps)
            out.append(summarize(name, [c.nuclear - norm(a) * norm(b) for c in done], [error(c) for c in done]))
    return out


def equal_classes(size: int) -> dict[str, list[Pattern]]:
    """Every pattern of a size x size table but the full one, by rigidity and by Hall's
    condition: with surplus, tight, or failing (no permutation)."""
    groups: dict[str, list[Pattern]] = {}
    for pattern in patterns(size, size):
        hall, surplus = hall_and_surplus(pattern)
        kind = "surplus" if surplus else "hall" if hall else "no matching"
        groups.setdefault(f"{'rigid' if rigid(pattern) else 'not rigid'}, {kind}", []).append(pattern)
    return dict(sorted(groups.items()))


def equal_weights(solver: Solver, size: int, steps: int) -> list[ClassSummary]:
    """Theorem E on J, the size x size table of ones; the error is the root mean square."""
    ones = [1 + 0j] * size
    return sweep(solver, equal_classes(size), ones, ones, steps, lambda c: c.error_rms)


def phases(draws: Draws, count: int) -> list[complex]:
    return [complex(math.cos(2 * math.pi * u), math.sin(2 * math.pi * u)) for u in draws.uniform(count)]


@dataclass(frozen=True)
class Table:
    """A table a bᵀ and the classes of its patterns."""

    name: str
    a: list[complex]
    b: list[complex]
    groups: dict[str, list[Pattern]]


def weighted_tables(draws: Draws, size: int, count: int) -> list[Table]:
    """`count` draws of a and b without zero entries, moduli uniform in [0.3, 2]; the nonempty
    patterns of each table but the full one, by rigidity and by Gale's condition."""
    tables = []
    for k in range(count):
        r = [0.3 + 1.7 * u for u in draws.uniform(size)]
        s = [0.3 + 1.7 * u for u in draws.uniform(size)]
        th = [2 * math.pi * u for u in draws.uniform(2 * size)]
        a = [r[i] * complex(math.cos(th[i]), math.sin(th[i])) for i in range(size)]
        b = [s[j] * complex(math.cos(th[size + j]), math.sin(th[size + j])) for j in range(size)]
        pa, pb = [abs(x) ** 2 / norm(a) ** 2 for x in a], [abs(x) ** 2 / norm(b) ** 2 for x in b]
        groups: dict[str, list[Pattern]] = {}
        for pattern in patterns(size, size):
            if any(any(row) for row in pattern):
                plan = gale_slack(pattern, pa, pb) >= -1e-12
                name = f"{'rigid' if rigid(pattern) else 'not rigid'}, {'plan' if plan else 'no plan'}"
                groups.setdefault(name, []).append(pattern)
        tables.append(Table(f"draw {k}", a, b, dict(sorted(groups.items()))))
    return tables


#: The generic tables with zero entries: shape, zero rows of a, zero columns of b.
GENERIC_ZEROS = [((2, 3), [0], []), ((2, 3), [], [1]), ((3, 3), [2], []), ((3, 3), [0], [0]),
                 ((3, 3), [], [1, 2]), ((3, 2), [1], [0]), ((2, 4), [], [3]), ((3, 4), [1], [2]),
                 ((3, 3), [], [])]

#: The tight tables: the moduli of a and of b, so that some set of rows fits with no room to spare.
TIGHT_MODULI = [([1, 1, 0], [1, 1, 0]), ([1, 1, 0], [1, 1, 1]), ([2, 1, 0], [1, 1, math.sqrt(3), 0]),
                ([1, math.sqrt(2), 0], [1, 0, math.sqrt(2)])]

#: The classes of Theorem G, in the order they are printed.
G_CLASSES = ["rigid, condition", "not rigid, condition", "rigid, no condition", "not rigid, no condition"]


def with_zeros(draws: Draws, count: int, zeros: list[int]) -> list[complex]:
    """`count` entries with moduli uniform in [0.3, 2] and random phases, then zeros at `zeros`."""
    moduli = [0.3 + 1.7 * u for u in draws.uniform(count)]
    return [0j if i in zeros else x * z for i, (x, z) in enumerate(zip(moduli, phases(draws, count)))]


def zero_tables(draws: Draws, tight: bool) -> list[Table]:
    """The tables of the zero-entry check, with random phases, and the classes of their
    patterns: rigid on the supports or not, Gale's condition or not."""
    if tight:
        pairs = [([x * z for x, z in zip(ma, phases(draws, len(ma)))],
                  [x * z for x, z in zip(mb, phases(draws, len(mb)))]) for ma, mb in TIGHT_MODULI]
    else:
        pairs = [(with_zeros(draws, m, za), with_zeros(draws, n, zb)) for (m, n), za, zb in GENERIC_ZEROS]
    tables = []
    for a, b in pairs:
        wa, wb = [abs(x) ** 2 for x in a], [abs(x) ** 2 for x in b]
        groups: dict[str, list[Pattern]] = {name: [] for name in G_CLASSES}
        for pattern in patterns(len(a), len(b)):
            rigid_g, condition = rigid_on_supports(pattern, wa, wb), gale(pattern, wa, wb)
            groups[f"{'rigid' if rigid_g else 'not rigid'}, {'condition' if condition else 'no condition'}"].append(pattern)
        zeros = [i for i, x in enumerate(a) if x == 0], [j for j, x in enumerate(b) if x == 0]
        tables.append(Table(f"{len(a)} x {len(b)}, zero rows {zeros[0]}, zero columns {zeros[1]}", a, b, groups))
    return tables


def slow_tight_hall(solver: Solver, size: int, checkpoints: Sequence[int]) -> Iterator[tuple[int, ClassSummary]]:
    """The rigid patterns of J with a tight Hall condition: model M after the first checkpoint
    on all of them, then, at every checkpoint, on those whose error was above RECOVERED there.
    Each summary comes as soon as its checkpoint is reached."""
    batch = equal_classes(size)["rigid, hall"]
    ones = [1 + 0j] * size
    run, done = solver.start(batch, ones, ones), 0
    for k, stop in enumerate(checkpoints):
        run.advance(stop - done)
        done = stop
        now = run.measure()
        yield stop, summarize(f"{len(now)} patterns", [c.nuclear - size for c in now], [c.error_rms for c in now])
        if k == 0:
            slow = [i for i, c in enumerate(now) if c.error_rms > RECOVERED]
            if not slow:
                return
            run.keep(slow)
            now = [now[i] for i in slow]
            yield stop, summarize(f"{len(now)} slow", [c.nuclear - size for c in now], [c.error_rms for c in now])
