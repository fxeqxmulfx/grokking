"""Patterns of kept cells, and the conditions on them that decide recovery.

A pattern of an m x n table is a tuple of m rows of n booleans: cell (i, j) is kept when
`pattern[i][j]`. The conditions are those of `review/flat_spectrum.md` in the transformer
repository, proved in Lean in `Transformer.Grokking.FlatSpectrum`:

- rigid: the kept cells connect the rows to the columns (`rigid_iff_connected`);
- Hall: every set of rows R meets at least |R| columns, so the pattern contains a
  permutation (Theorem E);
- Gale: every set of rows fits into the columns it meets, weighted (Theorems F and G,
  `exists_isTransportPlan_iff`).
"""

from collections.abc import Iterator, Sequence
from itertools import combinations

type Pattern = tuple[tuple[bool, ...], ...]


def patterns(m: int, n: int) -> Iterator[Pattern]:
    """Every pattern of an m x n table but the full one. Bit `n i + j` of a counter is the
    cell (i, j), so the empty pattern comes first."""
    for bits in range(1 << (m * n)):
        pattern = tuple(tuple((bits >> (n * i + j)) & 1 == 1 for j in range(n)) for i in range(m))
        if not all(all(row) for row in pattern):
            yield pattern


def seen(pattern: Pattern, rows: Sequence[int]) -> set[int]:
    """N(R): the columns that the kept cells of the rows R meet."""
    return {j for i in rows for j, kept in enumerate(pattern[i]) if kept}


def connects(pattern: Pattern, rows: Sequence[int], cols: Sequence[int]) -> bool:
    """Whether the kept cells inside rows x cols connect these rows to these columns: the
    bipartite graph on them, with an edge for each such cell, is connected. Both are nonempty."""
    rows, cols = list(rows), list(cols)
    reached, stack = {("row", rows[0])}, [("row", rows[0])]
    while stack:
        kind, v = stack.pop()
        if kind == "row":
            near = [("col", j) for j in cols if pattern[v][j]]
        else:
            near = [("row", i) for i in rows if pattern[i][v]]
        for w in near:
            if w not in reached:
                reached.add(w)
                stack.append(w)
    return len(reached) == len(rows) + len(cols)


def rigid(pattern: Pattern) -> bool:
    """The kept cells connect all the rows to all the columns."""
    return connects(pattern, range(len(pattern)), range(len(pattern[0])))


def rigid_on_supports(pattern: Pattern, wa: Sequence[float], wb: Sequence[float]) -> bool:
    """Rigidity on the supports of the weights: the kept cells with `wa[i] > 0` and `wb[j] > 0`
    connect these rows to these columns (`rigid_support_iff_connected`). True when a support
    is empty."""
    rows = [i for i, w in enumerate(wa) if w > 0]
    cols = [j for j, w in enumerate(wb) if w > 0]
    return not rows or not cols or connects(pattern, rows, cols)


def hall_and_surplus(pattern: Pattern) -> tuple[bool, bool]:
    """For a square table: Hall's condition, |N(R)| >= |R| for every set of rows R, and the
    surplus condition, |N(R)| > |R| for every proper nonempty R with N(all rows) = all columns.
    The surplus condition implies Hall's."""
    size = len(pattern)
    hall = surplus = True
    for r in range(1, size):
        for rows in combinations(range(size), r):
            meets = len(seen(pattern, rows))
            hall = hall and meets >= r
            surplus = surplus and meets > r
    if len(seen(pattern, range(size))) < size:
        hall = surplus = False
    return hall, surplus


def gale(pattern: Pattern, wa: Sequence[float], wb: Sequence[float]) -> bool:
    """Gale's condition for the weights `wa` of the rows and `wb` of the columns, not
    normalized: `sum(wb) * sum_R wa <= sum(wa) * sum_N(R) wb` for every nonempty set of rows R,
    up to a relative and an absolute tolerance of 1e-12."""
    total_a, total_b = sum(wa), sum(wb)
    for r in range(1, len(wa) + 1):
        for rows in combinations(range(len(wa)), r):
            left = total_b * sum(wa[i] for i in rows)
            right = total_a * sum(wb[j] for j in seen(pattern, rows))
            if left > right * (1 + 1e-12) + 1e-12:
                return False
    return True


def gale_slack(pattern: Pattern, pa: Sequence[float], pb: Sequence[float]) -> float:
    """The least room `sum_N(R) pb - sum_R pa` over nonempty sets of rows R, for probability
    vectors `pa` and `pb`; Gale's condition holds when it is not negative."""
    return min(
        sum(pb[j] for j in seen(pattern, rows)) - sum(pa[i] for i in rows)
        for r in range(1, len(pa) + 1)
        for rows in combinations(range(len(pa)), r)
    )
