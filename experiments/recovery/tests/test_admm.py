"""The ADMM solver on the matrices that broke it."""

import unittest

import torch

from recovery.infrastructure.admm import TorchADMM, flush, threshold

# An iterate of the 6 x 3 polar check at step 13448, to 18 digits. LAPACK returned NaN singular
# values for it without an error, although every entry has a normal modulus: the third row has
# entries of order 1e-296, one with an imaginary part of 1.1e-310. Its rows alone, or its first
# four rows, give finite singular values.
TINY_BESIDE_LARGE = [
    [0, 9.99789250374899078e-17 + 8.67664351843057432e-17j,
     -1.36653672223312930e-17 - 4.10132090956063550e-17j],
    [-5.36500078253092383e+00 - 5.73576494121609048e-01j,
     2.42434659994618250e-32 + 2.03774421580705961e-32j,
     -3.42379646576297660e-33 - 9.75902627361974260e-33j],
    [0, 2.18153321351281251e-296 - 1.29114372200135482e-296j,
     -8.27828463671237021e-297 - 1.12380897089520822e-310j],
    [0, -6.86594965553394943e+00 + 4.57071653817702384e+00j,
     2.68977218697066833e+00 - 1.42508385812786686e-01j],
    [0, 0, 0],
    [0, 0, 0],
]


class Admm(unittest.TestCase):
    def test_subnormal_entries(self) -> None:
        # Two rows of an iterate of the 6 x 3 polar check: LAPACK returned NaN singular values
        # for them, from the subnormal entries of the first row.
        m = torch.tensor([[0, 5.5832e-316 - 3.3045e-316j, -2.1187e-316 + 4.9407e-324j],
                          [0, -6.8659 + 4.5707j, 2.6898 - 0.14251j]], dtype=torch.complex128)
        for tau in (0.0, 1.0):
            x = threshold(m, tau)
            self.assertTrue(bool(torch.isfinite(torch.view_as_real(x)).all()))
        # With tau = 0 the thresholding returns m, the subnormal entries set to 0.
        self.assertLess(float((threshold(m, 0.0) - m).abs().max()), 1e-14)

    def test_tiny_entries_beside_large(self) -> None:
        m = torch.tensor(TINY_BESIDE_LARGE, dtype=torch.complex128)
        for tau in (0.0, 1.0):
            x = threshold(m, tau)
            self.assertTrue(bool(torch.isfinite(torch.view_as_real(x)).all()))
        self.assertLess(float((threshold(m, 0.0) - m).abs().max()), 1e-14)

    def test_flush_is_relative_to_each_matrix(self) -> None:
        m = torch.tensor([[[1.0, 1e-17 + 1j]], [[1e-20, 1e-37j]]], dtype=torch.complex128)
        expected = torch.tensor([[[1.0, 1j]], [[1e-20, 0]]], dtype=torch.complex128)
        self.assertTrue(bool(torch.equal(flush(m), expected)))

    def test_measure_rejects_non_finite(self) -> None:
        run = TorchADMM("cpu").start_matrices([((True, False), (False, True))], [[[1, 0], [0, 1]]])
        run.advance(10)
        run.measure()
        run.z[0, 0, 1] = float("nan")
        with self.assertRaises(FloatingPointError):
            run.measure()


if __name__ == "__main__":
    unittest.main()
