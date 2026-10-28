"""The certificates of Theorem D, item 2, in torch: Y vanishing off a square pattern with unit
row and column sums, measured by ‖Y − J/N‖_op. Ported from `patterns.py` (least squares) and
`certopt.py` (projected subgradient descent) of the first checks."""

from collections.abc import Sequence

import torch

from recovery.domain.patterns import Pattern


def sums_operator(m: torch.Tensor) -> torch.Tensor:
    """The 2N x 2N matrix of the row and column sums of Y_ij = m_ij (u_i + v_j) in (u, v)."""
    size = m.shape[0]
    a = torch.zeros(2 * size, 2 * size, dtype=torch.float64)
    a[:size, :size] = torch.diag(m.sum(1))
    a[:size, size:] = m
    a[size:, :size] = m.T
    a[size:, size:] = torch.diag(m.sum(0))
    return a


def sums_residual(y: torch.Tensor) -> float:
    return max((y.sum(1) - 1).abs().max().item(), (y.sum(0) - 1).abs().max().item())


class TorchCertificates:
    def least_squares(self, pattern: Pattern) -> tuple[float, float]:
        m = torch.tensor(pattern, dtype=torch.float64)
        size = m.shape[0]
        ones = torch.ones(2 * size, 1, dtype=torch.float64)
        uv = torch.linalg.lstsq(sums_operator(m), ones, driver="gelsd").solution.squeeze(1)
        y = m * (uv[:size].view(-1, 1) + uv[size:].view(1, -1))
        return self._norm(y), sums_residual(y)

    def best(self, pattern: Pattern, steps: int) -> tuple[float, float]:
        m = torch.tensor(pattern, dtype=torch.float64)
        size = m.shape[0]
        inverse, ones = torch.linalg.pinv(sums_operator(m)), torch.ones(size, dtype=torch.float64)

        def project(d: torch.Tensor) -> torch.Tensor:
            """The closest Y to d that vanishes off the pattern with unit row and column sums."""
            d = m * d
            uv = inverse @ torch.cat([ones - d.sum(1), ones - d.sum(0)])
            return d + m * (uv[:size].view(-1, 1) + uv[size:].view(1, -1))

        q = torch.ones(size, size, dtype=torch.float64) / size
        y = project(torch.zeros(size, size, dtype=torch.float64))
        best = self._norm(y)
        for t in range(steps):
            left, s, right = torch.linalg.svd(y - q)
            best = min(best, s[0].item())
            top = int((s > s[0] - 1e-9).sum())
            y = project(y - 0.5 / (1 + t) ** 0.5 * (left[:, :top] @ right[:top, :] / top))
        violation = max(sums_residual(y), (y * (1 - m)).abs().max().item())
        return min(best, self._norm(y)), violation

    def operator_norm(self, matrix: Sequence[Sequence[complex]]) -> float:
        return torch.linalg.matrix_norm(torch.tensor(matrix, dtype=torch.complex128), ord=2).item()

    @staticmethod
    def _norm(y: torch.Tensor) -> float:
        return torch.linalg.matrix_norm(y - 1 / y.shape[0], ord=2).item()
