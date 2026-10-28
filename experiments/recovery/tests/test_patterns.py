"""The classes of the checks, against the counts the first checks printed."""

import unittest

from recovery.application.sweeps import equal_classes, weighted_tables, zero_tables
from recovery.domain.patterns import gale, rigid_on_supports
from recovery.infrastructure.draws import TorchDraws


def counts(groups: dict[str, list]) -> dict[str, int]:
    return {name: len(batch) for name, batch in groups.items()}


class Classes(unittest.TestCase):
    def test_three_by_three_ones(self) -> None:
        self.assertEqual(counts(equal_classes(3)), {
            "not rigid, hall": 51, "not rigid, no matching": 256,
            "rigid, hall": 162, "rigid, no matching": 9, "rigid, surplus": 33,
        })

    def test_four_by_four_ones(self) -> None:
        self.assertEqual(counts(equal_classes(4)), {
            "not rigid, hall": 3970, "not rigid, no matching": 25249,
            "rigid, hall": 27068, "rigid, no matching": 2464, "rigid, surplus": 6784,
        })

    def test_zero_entries(self) -> None:
        for tight, expected in [(False, [790, 0, 1118, 4675]), (True, [1220, 224, 464, 3720])]:
            total = [0, 0, 0, 0]
            for table in zero_tables(TorchDraws(0), tight):
                for k, batch in enumerate(table.groups.values()):
                    total[k] += len(batch)
            self.assertEqual(total, expected, "tight" if tight else "generic")

    def test_random_weights(self) -> None:
        for table in weighted_tables(TorchDraws(0), 3, 3):
            self.assertEqual(counts(table.groups), {"not rigid, no plan": 306, "rigid, no plan": 114, "rigid, plan": 90})

    def test_lean_examples(self) -> None:
        # forall_isMinOn_vecMulVec_iff_support: the cell (0, 0) recovers (1)(1, 0)ᵀ, not (1)(1, 1)ᵀ.
        cell = ((True, False),)
        self.assertTrue(rigid_on_supports(cell, [1], [1, 0]) and gale(cell, [1], [1, 0]))
        self.assertFalse(rigid_on_supports(cell, [1], [1, 1]))
        # Theorem F: the triangle recovers (2, 1)(1, 2)ᵀ, not (1, 2)(2, 1)ᵀ.
        triangle = ((True, True), (False, True))
        self.assertTrue(gale(triangle, [4, 1], [1, 4]))
        self.assertFalse(gale(triangle, [1, 4], [4, 1]))


if __name__ == "__main__":
    unittest.main()
