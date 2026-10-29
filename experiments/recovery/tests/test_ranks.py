"""Rank above one: the three-cell fill, the graph condition, the certificates and the solver's
dual against the Lean statements and examples."""

import math
import unittest

from recovery.application.ranks import EXAMPLES, THREE_CELLS, polar_blocks, polar_table
from recovery.domain.patterns import diagonals
from recovery.domain.ranks import joins_every_entry, three_cell_fill
from recovery.infrastructure.admm import TorchADMM
from recovery.infrastructure.draws import TorchDraws
from recovery.infrastructure.rank_certificates import TorchRankCertificates


class Ranks(unittest.TestCase):
    def test_three_cell_fill(self) -> None:
        # The Lean examples: [[2, 1], [1, 1]] and [[2, 1], [2, 1]] are recovered, M fills
        # [[2, 1], [1, −1]] with −1, and b = c = 0 gives 0.
        self.assertAlmostEqual(three_cell_fill(1, 2), 1)
        self.assertAlmostEqual(three_cell_fill(1, -2), -1)
        self.assertAlmostEqual(three_cell_fill(2, 2), 1)
        self.assertEqual(three_cell_fill(0, 0), 0)
        # Rank one with |k01| > |k10|: |k10| k01 / |k01| (`threeCellFill_mul_of_lt`).
        self.assertAlmostEqual(three_cell_fill(1, 2), 1 * 2 / 2)
        a, b = 3 - 1j, 0.5j
        self.assertAlmostEqual(three_cell_fill(b, a * b), abs(b) * a / abs(a))
        # Moduli one: k00 k11 / k10 (`threeCellFill_of_norm_eq_one`).
        b, c = complex(math.cos(1), math.sin(1)), complex(math.cos(2), math.sin(2))
        self.assertAlmostEqual(three_cell_fill(b, c), c / b)

    def test_joins_every_entry(self) -> None:
        # The example of `not_forall_isMinOn_of_not_rigid_support`: [[1, 1], [0, 1]] on the diagonal.
        table = [[1, 1], [0, 1]]
        self.assertFalse(joins_every_entry(((True, False), (False, True)), table))
        self.assertTrue(joins_every_entry(((True, True), (True, True)), table))
        # The zero entry needs nothing: (0, 0), (0, 1), (1, 1) join every nonzero entry.
        self.assertTrue(joins_every_entry(((True, True), (False, True)), table))

    def test_solver_fills_x_star(self) -> None:
        tables = [[[complex(x) for x in row] for row in t] for t in EXAMPLES.values()]
        run = TorchADMM().start_matrices([THREE_CELLS] * len(tables), tables)
        run.advance(3000)
        for k, z in zip(tables, run.matrices()):
            self.assertAlmostEqual(abs(z[0][1] - three_cell_fill(k[1][0], k[0][0] * k[1][1])), 0, places=6)

    def test_rank_one_certificate_is_theorem_d(self) -> None:
        # K = J, two diagonals of offsets 0 and 1: the certificate of least Frobenius norm is
        # Y = (P + P')/2, with ‖Y − J/N‖_op = cos(π/N) (Theorem D, item 11).
        for size in (3, 5, 7):
            ones = [[1 + 0j] * size for _ in range(size)]
            c = TorchRankCertificates().certificate(ones, diagonals(size, [0, 1]), 1, 0)
            assert c.least_squares is not None
            self.assertAlmostEqual(c.least_squares, math.cos(math.pi / size), places=9)
            self.assertGreater(c.injectivity, 1e-3)
            # One diagonal: r_i − r_j vanishes on it, so h ↦ h on Ω is not injective (item D.6).
            self.assertLess(TorchRankCertificates().certificate(ones, diagonals(size, [0]), 1, 0).injectivity, 1e-9)

    def test_dual_decides_the_minimum(self) -> None:
        # Item 5 on Lean's examples. From the three cells, [[2, 1], [1, 1]] is recovered and its
        # polar factor is 1; [[2, 1], [1, −1]] is not, and M's minimum [[2, −1], [1, −1]] has
        # nuclear norm 3 < √13 (item 3). diag(1, 2) is a minimum from its diagonal
        # (`isMinOn_iff_of_full_rank`).
        diagonal = ((True, False), (False, True))
        cases = [([[2 + 0j, 1], [1, 1]], THREE_CELLS, True), ([[2 + 0j, 1], [1, -1]], THREE_CELLS, False),
                 ([[1 + 0j, 0], [0, 2]], diagonal, True)]
        run = TorchADMM().start_matrices([pattern for _, pattern, _ in cases], [k for k, _, _ in cases])
        run.advance(3000)
        for (k, pattern, minimum), z, y in zip(cases, run.matrices(), run.duals()):
            d = TorchRankCertificates().dual(k, pattern, 2, z, y)
            self.assertLess(d.norm, 1 + 1e-9)
            self.assertEqual(d.off, 0)
            self.assertEqual(d.polar_off < 1e-12, minimum)
            if minimum:
                self.assertLess(d.defect, 1e-9)
                self.assertLess(max(d.right, d.left), 1e-6)
            else:
                self.assertAlmostEqual(d.defect, math.sqrt(13) - 3, places=6)

    def test_polar_table(self) -> None:
        # K = Q P is dense, and its polar factor U Vᴴ is Q, which vanishes off the blocks.
        draws = TorchDraws(0)
        for rows, columns in ((4, 4), (6, 3), (8, 2)):
            k = polar_table(draws, rows, columns)
            blocks = polar_blocks(rows, columns)
            pattern = tuple(tuple((i, j) in blocks for j in range(columns)) for i in range(rows))
            zero = [[0j] * columns for _ in range(rows)]
            self.assertLess(TorchRankCertificates().dual(k, pattern, columns, k, zero).polar_off, 1e-12)
            self.assertTrue(all(abs(x) > 1e-6 for row in k for x in row))


if __name__ == "__main__":
    unittest.main()
