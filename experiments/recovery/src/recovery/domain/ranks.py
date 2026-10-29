"""Tables of rank above one, as `review/flat_spectrum.md` (*Rank above one*) in the transformer
repository states them and `Transformer.Grokking.FlatSpectrum` proves them.

- `three_cell_fill`: from the cells of a 2 x 2 table other than (0, 1), M has exactly one
  minimum, with conj(b) c / max(|b|², |c|) at (0, 1), b = k₁₀ and c = k₀₀ k₁₁, and 0 there when
  b = c = 0 (`threeCellFill`, `isMinOn_threeCells_iff`). So M recovers K exactly when k₀₁ is
  that value (`forall_isMinOn_threeCells_iff`).
- `joins_every_entry`: if M recovers K from a pattern, the kept cells where K is nonzero join the
  row and the column of every nonzero entry (`reachable_of_forall_isMinOn`).
"""

from collections.abc import Sequence

from recovery.domain.patterns import Pattern


def three_cell_fill(b: complex, c: complex) -> complex:
    top = max(abs(b) ** 2, abs(c))
    return 0j if top == 0 else b.conjugate() * c / top


def joins_every_entry(pattern: Pattern, table: Sequence[Sequence[complex]]) -> bool:
    """Whether the bipartite graph on the rows and the columns, with an edge for each kept cell
    where the table is nonzero, joins the row and the column of every nonzero entry."""
    m, n = len(table), len(table[0])
    parent = list(range(m + n))

    def find(v: int) -> int:
        while parent[v] != v:
            parent[v] = parent[parent[v]]
            v = parent[v]
        return v

    for i in range(m):
        for j in range(n):
            if pattern[i][j] and table[i][j] != 0:
                parent[find(i)] = find(m + j)
    return all(find(i) == find(m + j) for i in range(m) for j in range(n) if table[i][j] != 0)
