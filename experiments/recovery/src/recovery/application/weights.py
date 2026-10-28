"""The checks of Theorem F (`forall_isMinOn_vecMulVec_iff_of_ne_zero` in the transformer
repository) on tables a bᵀ without zero entries: random weights, weights with exact ties, and
the cross of row 0 and column 0 (item 4, `forall_isMinOn_vecMulVec_cross_iff`)."""

import math
from collections.abc import Iterator, Sequence

from recovery.application.ports import Draws, Solver
from recovery.application.summary import ClassSummary, summarize
from recovery.application.sweeps import Table, norm, phases
from recovery.domain.patterns import Pattern, cross, cross_margin, gale_slack, patterns, rigid


def weighted_table(name: str, a: list[complex], b: list[complex]) -> Table:
    """The nonempty patterns of a bᵀ but the full one, by rigidity and by Gale's condition for
    the shares `|a_i|²/‖a‖²` and `|b_j|²/‖b‖²` (a plan), with a tolerance of 1e-12."""
    pa, pb = [abs(x) ** 2 / norm(a) ** 2 for x in a], [abs(x) ** 2 / norm(b) ** 2 for x in b]
    groups: dict[str, list[Pattern]] = {}
    for pattern in patterns(len(a), len(b)):
        if any(any(row) for row in pattern):
            plan = gale_slack(pattern, pa, pb) >= -1e-12
            kind = f"{'rigid' if rigid(pattern) else 'not rigid'}, {'plan' if plan else 'no plan'}"
            groups.setdefault(kind, []).append(pattern)
    return Table(name, a, b, dict(sorted(groups.items())))


def weighted_tables(draws: Draws, size: int, count: int) -> list[Table]:
    """`count` draws of a and b without zero entries, moduli uniform in [0.3, 2], random phases."""
    tables = []
    for k in range(count):
        r = [0.3 + 1.7 * u for u in draws.uniform(size)]
        s = [0.3 + 1.7 * u for u in draws.uniform(size)]
        z = phases(draws, 2 * size)
        tables.append(weighted_table(f"draw {k}", [x * w for x, w in zip(r, z)], [x * w for x, w in zip(s, z[size:])]))
    return tables


#: Moduli of a and b with exact ties: the shares `|a_i|²/‖a‖²` and `|b_j|²/‖b‖²` are (½, ¼, ¼)
#: for both (A), (½, ¼, ¼) and (¼, ¼, ½) (B), and (⅗, ⅕, ⅕) and (⅕, ⅖, ⅖) (C). Some proper set of
#: rows then fills the columns it meets with no room to spare.
TIGHT_WEIGHTS = {
    "A": ([math.sqrt(2), 1.0, 1.0], [math.sqrt(2), 1.0, 1.0]),
    "B": ([math.sqrt(2), 1.0, 1.0], [1.0, 1.0, math.sqrt(2)]),
    "C": ([math.sqrt(3), 1.0, 1.0], [1.0, math.sqrt(2), math.sqrt(2)]),
}


def tight_tables(draws: Draws) -> list[Table]:
    """The tables of TIGHT_WEIGHTS, in this order, each with its own random phases."""
    tables = []
    for name, (r, s) in TIGHT_WEIGHTS.items():
        z = phases(draws, len(r) + len(s))
        tables.append(weighted_table(name, [x * w for x, w in zip(r, z)], [x * w for x, w in zip(s, z[len(r):])]))
    return tables


def slow_tight_weights(solver: Solver, draws: Draws, checkpoints: Sequence[int]) -> Iterator[tuple[int, ClassSummary, Pattern]]:
    """The rigid patterns with a plan of table A of TIGHT_WEIGHTS, at every checkpoint: their
    summary, with the error of the hidden cells, and the pattern of the largest error."""
    table = tight_tables(draws)[0]
    batch = table.groups["rigid, plan"]
    run, done = solver.start(batch, table.a, table.b), 0
    for stop in checkpoints:
        run.advance(stop - done)
        done = stop
        now = run.measure()
        errors = [c.error_of_hidden for c in now]
        worst = max(range(len(now)), key=errors.__getitem__)
        gaps = [c.nuclear - norm(table.a) * norm(table.b) for c in now]
        yield stop, summarize("A, rigid, plan", gaps, errors), batch[worst]


#: The bins of the margin m of the cross check: `low < m <= high`.
MARGIN_BINS = [("m <= -0.05", -math.inf, -0.05), ("-0.05 < m <= 0", -0.05, 0.0),
               ("0 < m <= 0.05", 0.0, 0.05), ("m > 0.05", 0.05, math.inf)]


def cross_tables(draws: Draws, size: int, count: int) -> list[tuple[list[complex], list[complex]]]:
    """`count` pairs a, b of length `size`: moduli uniform in [0.3, 2], then |a_0| and |b_0| set so
    that the shares `|a_0|²/‖a‖²` and `|b_0|²/‖b‖²` are uniform in (0.05, 0.95), then random
    phases. The numbers are drawn in the order of the first check, `cross_weights.py`."""
    moduli_a, moduli_b = draws.uniform(count * size), draws.uniform(count * size)
    share_a = [0.05 + 0.9 * u for u in draws.uniform(count)]
    share_b = [0.05 + 0.9 * u for u in draws.uniform(count)]
    phase_a, phase_b = phases(draws, count * size), phases(draws, count * size)

    def vector(moduli: list[float], share: float, phase: list[complex]) -> list[complex]:
        r = [0.3 + 1.7 * u for u in moduli]
        r[0] = math.sqrt(share / (1 - share) * sum(x ** 2 for x in r[1:]))
        return [x * z for x, z in zip(r, phase)]

    cut = [slice(k * size, (k + 1) * size) for k in range(count)]
    return [(vector(moduli_a[c], share_a[k], phase_a[c]), vector(moduli_b[c], share_b[k], phase_b[c]))
            for k, c in enumerate(cut)]


def cross_check(solver: Solver, draws: Draws, sizes: Sequence[int], count: int, steps: int) -> Iterator[tuple[int, list[ClassSummary]]]:
    """Model M on the cross of `count` tables of each size, drawn in this order: the summaries
    of the margin bins that are not empty, with the error of the hidden cells."""
    for size in sizes:
        tables = cross_tables(draws, size, count)
        run = solver.start_tables(cross(size), tables)
        run.advance(steps)
        done = run.measure()
        margins = [cross_margin([abs(x) ** 2 for x in a], [abs(x) ** 2 for x in b]) for a, b in tables]
        gaps = [c.nuclear - norm(a) * norm(b) for c, (a, b) in zip(done, tables)]
        out = []
        for name, low, high in MARGIN_BINS:
            inside = [k for k, m in enumerate(margins) if low < m <= high]
            if inside:
                out.append(summarize(name, [gaps[k] for k in inside], [done[k].error_of_hidden for k in inside]))
        yield size, out
