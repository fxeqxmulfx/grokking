"""The patterns of the large checks, against what the first checks printed (`matching.py`)."""

import unittest

from recovery.application.additive import random_density, survey_patterns
from recovery.domain.matchings import block_bound, elementary, leaves, max_matching
from recovery.domain.patterns import cross, diagonals, rigid, without
from recovery.domain.residues import discrete_log, primitive_root
from recovery.domain.splits import training_pattern
from recovery.infrastructure.draws import TorchDraws


class Large(unittest.TestCase):
    def test_training_split(self) -> None:
        for p in (31, 61, 97):
            for seed in (7, 11):
                split = training_pattern(p, seed)
                self.assertEqual(sum(map(sum, split)), p * p // 2)
                self.assertTrue(elementary(split))

    def test_structure(self) -> None:
        cases = {  # pattern: rigid, matching, elementary, block bound, leaves
            "cross": (cross(31), (True, 2, False, 30.0, (30, 30))),
            "two diagonals minus a cell": (without(diagonals(31, [0, 1]), 0, 1), (True, 31, False, 1.0, (1, 1))),
            "two diagonals": (diagonals(31, [0, 1]), (True, 31, True, 0.6952, (0, 0))),
            "training split 7": (training_pattern(31, 7), (True, 31, True, 0.2646, (0, 0))),
        }
        for name, (pattern, (rigid_, matching, elementary_, bound, leaf)) in cases.items():
            self.assertEqual(rigid(pattern), rigid_, name)
            self.assertEqual(max_matching(pattern)[0], matching, name)
            self.assertEqual(elementary(pattern), elementary_, name)
            self.assertAlmostEqual(block_bound(pattern), bound, places=4, msg=name)
            self.assertEqual(leaves(pattern), leaf, name)

    def test_random_patterns(self) -> None:
        # p = 61 at 8 %, draw 1: rigid, but its largest matching has 60 cells; the failure.
        pattern = random_density(TorchDraws(1000 * 61 + 1), 61, 0.08)
        self.assertEqual((sum(map(sum, pattern)), rigid(pattern), max_matching(pattern)[0]), (272, True, 60))
        self.assertAlmostEqual(block_bound(pattern), 1.4261, places=4)
        rigid_count = sum(rigid(q) for name, q in survey_patterns(31, TorchDraws).items() if name.startswith("random"))
        self.assertEqual(rigid_count, 7)

    def test_residues(self) -> None:
        self.assertEqual([primitive_root(p) for p in (31, 61, 97)], [3, 2, 5])
        log = discrete_log(31)
        self.assertEqual((log[0], log[1], log[3], sorted(k for k in log if k is not None)), (None, 0, 1, list(range(30))))


if __name__ == "__main__":
    unittest.main()
