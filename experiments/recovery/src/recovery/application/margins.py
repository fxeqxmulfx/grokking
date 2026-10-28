"""The failure margin: model M on J off every block with k + l > N, and on random patterns
without a permutation graph, against the values of `domain.margins`."""

from dataclasses import dataclass

from recovery.application.ports import Draws, Solver
from recovery.application.sweeps import solve
from recovery.domain.margins import block_value, least_block_value, off_block
from recovery.domain.matchings import max_matching
from recovery.domain.patterns import Pattern, rigid


@dataclass(frozen=True)
class OffBlock:
    """Model M off one k x l block: the value Lean proves least, and ‖Z‖_S1 at the end."""

    k: int
    l: int
    value: float
    nuclear: float


def off_blocks(solver: Solver, size: int, steps: int) -> list[OffBlock]:
    """Every k x l block with k + l > N, rows and columns from the first."""
    blocks = [(k, l) for k in range(1, size + 1) for l in range(1, size + 1) if k + l > size]
    ones = [1 + 0j] * size
    done = solve(solver, [off_block(size, k, l) for k, l in blocks], ones, ones, steps)
    return [OffBlock(k, l, block_value(size, k, l), c.nuclear) for (k, l), c in zip(blocks, done)]


@dataclass(frozen=True)
class RandomMargins:
    """Model M on random patterns without a permutation graph, of one kind (rigid or not)."""

    name: str
    count: int
    #: The largest gap ‖Z‖_S1 − N.
    gap: float
    #: The largest ‖Z‖_S1 minus the least block value of the pattern.
    over_value: float
    #: The largest least block value minus N.
    value: float


def without_permutation(draws: Draws, size: int, count: int) -> list[Pattern]:
    """`count` random patterns that contain no permutation graph: each draws a density
    uniform in [0.3, 0.9], then keeps each cell with that probability; a pattern with a
    permutation graph is drawn again."""
    out: list[Pattern] = []
    while len(out) < count:
        density = 0.3 + 0.6 * draws.uniform(1)[0]
        u = draws.uniform(size * size)
        pattern = tuple(tuple(u[size * i + j] < density for j in range(size)) for i in range(size))
        if max_matching(pattern)[0] < size:
            out.append(pattern)
    return out


def random_margins(solver: Solver, draws: Draws, size: int, count: int, steps: int) -> list[RandomMargins]:
    """The rigid and the other patterns of `without_permutation`, solved together."""
    batch = without_permutation(draws, size, count)
    ones = [1 + 0j] * size
    done = solve(solver, batch, ones, ones, steps)
    out = []
    for name, kind in (("rigid", True), ("not rigid", False)):
        rows = [(c.nuclear, v) for p, c in zip(batch, done)
                if rigid(p) == kind and (v := least_block_value(p)) is not None]
        if rows:
            out.append(RandomMargins(name, len(rows), max(x for x, _ in rows) - size,
                                     max(x - v for x, v in rows), max(v for _, v in rows) - size))
    return out
