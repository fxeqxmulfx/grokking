"""The failure margin of `review/flat_spectrum.md` in the transformer repository, section
"The failure margin", proved in Lean in `Transformer.Grokking.FlatSpectrum.FailureMargin`,
`MarginSharp` and `MarginLargest`:

- off a block R x C of an N x N table with |R| = k, |C| = l and k + l > N, the least nuclear
  norm of a matrix equal to J is √(k (N − l)) + √(l (N − k))
  (`isLeast_nuclearNorm_compl_block_card`), and the cells off the block contain no
  permutation graph;
- a pattern without a permutation graph misses such a block with k + l = N + 1
  (`exists_nuclearNorm_eq_of_not_perm`), and then this value is at most √(N² − 1)
  (`exists_nuclearNorm_le_sqrt_of_not_perm`);
- for a + b = N + 1 with a ≤ b ≤ a + 1, the largest least norm over the patterns without a
  permutation graph is √(a (a − 1)) + √(b (b − 1)), the value of the a x b block
  (`failureMargin`).
"""

import math
from itertools import combinations

from recovery.domain.patterns import Pattern, seen


def block_value(size: int, k: int, l: int) -> float:
    """√(k (N − l)) + √(l (N − k)) for N = size."""
    return math.sqrt(k * (size - l)) + math.sqrt(l * (size - k))


def off_block(size: int, k: int, l: int) -> Pattern:
    """The cells off the block of the first k rows and the first l columns."""
    return tuple(tuple(not (i < k and j < l) for j in range(size)) for i in range(size))


def least_block_value(pattern: Pattern) -> float | None:
    """The least block value over the blocks R x C that a square pattern misses with
    |R| + |C| > N, or None if it misses none, that is, if it contains a permutation graph.
    Each such block gives a matrix equal to J on the pattern with this nuclear norm
    (`exists_nuclearNorm_eq_of_block`), so model M's least norm is at most this value."""
    size = len(pattern)
    values = [block_value(size, k, l)
              for k in range(1, size + 1)
              for rows in combinations(range(size), k)
              for l in range(size + 1 - k, size - len(seen(pattern, rows)) + 1)]
    return min(values, default=None)


def worst_block(size: int) -> tuple[int, int]:
    """The k x l block with k + l = N + 1 of the largest value, the least k among ties, by
    search: by `failureMargin`, k = a and l = b, and its value is the largest least norm of
    model M on J over the patterns without a permutation graph."""
    k = max(range(1, size + 1), key=lambda k: (block_value(size, k, size + 1 - k), -k))
    return k, size + 1 - k
