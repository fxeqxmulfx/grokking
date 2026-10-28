"""The matching structure of a square pattern, against which `review/flat_spectrum.md` reads
the large checks (section "Patterns"):

- a perfect matching: the pattern contains the graph of a permutation (Hall's condition,
  Theorem E);
- elementary: rigid, and every kept cell lies on a perfect matching inside the pattern;
- the block bound: if the pattern misses a block R x C with |R| = k and |C| = l, every
  certificate Y has ‖Y − J/N‖_op ≥ √(k l / ((N − k)(N − l))) (Theorem D, item 10);
- leaves: rows and columns with a single kept cell, the case k = 1, l = N − 1 of the bound.
"""

from recovery.domain.patterns import Pattern, rigid


def max_matching(pattern: Pattern) -> tuple[int, list[int]]:
    """The size of a maximum matching by augmenting paths, rows in order, and the row matched
    to each column (−1 if none)."""
    size = len(pattern)
    cells = [[j for j, kept in enumerate(row) if kept] for row in pattern]
    row_of = [-1] * size

    def augment(i: int, seen: list[bool]) -> bool:
        for j in cells[i]:
            if not seen[j]:
                seen[j] = True
                if row_of[j] < 0 or augment(row_of[j], seen):
                    row_of[j] = i
                    return True
        return False

    return sum(augment(i, [False] * size) for i in range(size)), row_of


def elementary(pattern: Pattern) -> bool:
    """Rigid, with a perfect matching m, and the digraph on rows with i → i' when (i, m(i')) is
    kept strongly connected: then every kept cell lies on a perfect matching."""
    size = len(pattern)
    matched, row_of = max_matching(pattern)
    if matched < size or not rigid(pattern):
        return False
    after = [[row_of[j] for j, kept in enumerate(row) if kept and row_of[j] != i] for i, row in enumerate(pattern)]
    before: list[list[int]] = [[] for _ in range(size)]
    for i, targets in enumerate(after):
        for t in targets:
            before[t].append(i)

    def reaches_all(succ: list[list[int]]) -> bool:
        seen, stack = {0}, [0]
        while stack:
            for w in succ[stack.pop()]:
                if w not in seen:
                    seen.add(w)
                    stack.append(w)
        return len(seen) == size

    return reaches_all(after) and reaches_all(before)


def block_bound(pattern: Pattern) -> float:
    """The largest √(k l / ((N − k)(N − l))) over the missed blocks R x C that one row (or one
    column) gives: S its cells, R the rows whose cells all lie in S, C the columns outside S;
    0 if no such block has R and C nonempty and proper. A lower bound for every certificate."""
    size = len(pattern)
    best = 0.0
    for lines in (pattern, tuple(zip(*pattern))):
        for line in lines:
            k = sum(all(s or not kept for s, kept in zip(line, other)) for other in lines)
            l = size - sum(line)
            if 0 < k < size and 0 < l < size:
                best = max(best, (k * l / ((size - k) * (size - l))) ** 0.5)
    return best


def leaves(pattern: Pattern) -> tuple[int, int]:
    """The rows and the columns with exactly one kept cell."""
    return sum(sum(row) == 1 for row in pattern), sum(sum(col) == 1 for col in zip(*pattern))
