"""The values of the failure margin against the closed forms of the Lean statements."""

import math
import unittest

from recovery.application.margins import without_permutation
from recovery.domain.margins import block_value, least_block_value, off_block, worst_block
from recovery.domain.matchings import max_matching
from recovery.domain.patterns import cross, patterns
from recovery.infrastructure.draws import TorchDraws


def value_of(pattern: tuple[tuple[bool, ...], ...]) -> float:
    value = least_block_value(pattern)
    assert value is not None
    return value


class Margins(unittest.TestCase):
    def test_worst_blocks(self) -> None:
        # failureMargin_odd: √(N² − 1) for odd N; failureMargin_four: √2 + √6 for N = 4.
        expected = {3: math.sqrt(8), 4: math.sqrt(2) + math.sqrt(6), 5: math.sqrt(24), 6: math.sqrt(6) + math.sqrt(12),
                    7: math.sqrt(48)}
        for size, value in expected.items():
            k, l = worst_block(size)
            self.assertEqual((k, l), ((size + 1) // 2, size + 1 - (size + 1) // 2))
            self.assertAlmostEqual(block_value(size, k, l), value, places=12)
            self.assertLessEqual(value, math.sqrt(size * size - 1) + 1e-12)
            self.assertLess(math.sqrt(size * size - 1), size - 1 / (2 * size))

    def test_off_block(self) -> None:
        # The cells off a block with k + l > N contain no permutation graph, and its own value is
        # the least block value: isLeast_nuclearNorm_compl_block_card makes it M's least norm.
        for size in (3, 4, 5):
            for k in range(1, size + 1):
                for l in range(size + 1 - k, size + 1):
                    pattern = off_block(size, k, l)
                    self.assertLess(max_matching(pattern)[0], size)
                    self.assertAlmostEqual(value_of(pattern), block_value(size, k, l), places=12)
        # The cross is the cells off the (N − 1) x (N − 1) block: 2√(N − 1).
        self.assertEqual(cross(4), tuple(tuple(reversed(row)) for row in reversed(off_block(4, 3, 3))))
        self.assertAlmostEqual(value_of(cross(4)), 2 * math.sqrt(3), places=12)

    def test_least_block_value_needs_no_permutation(self) -> None:
        # Hall's theorem: a pattern misses a block with k + l > N exactly when it has no permutation graph.
        for pattern in patterns(3, 3):
            self.assertEqual(least_block_value(pattern) is None, max_matching(pattern)[0] == 3)

    def test_random_patterns(self) -> None:
        batch = without_permutation(TorchDraws(0), 5, 50)
        self.assertEqual(len(batch), 50)
        self.assertTrue(all(max_matching(p)[0] < 5 for p in batch))
        self.assertTrue(all(value_of(p) <= math.sqrt(24) + 1e-12 for p in batch))


if __name__ == "__main__":
    unittest.main()
