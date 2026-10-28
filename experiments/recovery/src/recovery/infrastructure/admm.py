"""Model M by ADMM in torch, on a batch of patterns at once.

min ‖X‖_S1 subject to X = K on the kept cells, split as X = Z with Z in the affine set:
X ← SVT_{1/ρ}(Z − U), Z ← X + U with the kept cells reset to K, U ← U + X − Z, from Z = K on
the kept cells and 0 elsewhere, U = 0, and ρ = 1/√max(m, n). A batch runs a fixed number of
steps; one table (`fill`) stops as soon as both residuals ‖X − Z‖ and ‖Z − Z_before‖ fall below
a tolerance. Ported from the scripts `small.py`, `weighted.py`, `cross_weights.py`,
`zeros_check.py` and `complete.py` of the first checks, which used this iteration.
"""

import math
from collections.abc import Iterator, Sequence

import torch

from recovery.application.ports import Completion, Fill
from recovery.domain.patterns import Pattern


def threshold(m: torch.Tensor, tau: float) -> torch.Tensor:
    """Singular value thresholding: every singular value s of m becomes max(s − tau, 0). When
    LAPACK's divide and conquer fails to converge, which it rarely does, m is perturbed by 1e-13
    of its largest entry first, as in `complete.py` of the first checks."""
    try:
        left, s, right = torch.linalg.svd(m, full_matrices=False)
    except torch.linalg.LinAlgError:
        noise = torch.randn(m.shape, generator=torch.Generator().manual_seed(0), dtype=torch.float64)
        left, s, right = torch.linalg.svd(m + 1e-13 * m.abs().max() * noise.to(m.device, m.dtype), full_matrices=False)
    return (left * torch.clamp(s - tau, min=0.0).to(m.dtype).unsqueeze(-2)) @ right


class TorchRun:
    def __init__(self, masks: torch.Tensor, table: torch.Tensor) -> None:
        self.masks, self.table = masks, table
        self.rho = 1.0 / math.sqrt(max(table.shape[-2:]))
        self.z = torch.where(masks, table, torch.zeros_like(table))
        self.u = torch.zeros_like(table)

    def step(self) -> torch.Tensor:
        """One step; returns X."""
        x = threshold(self.z - self.u, 1.0 / self.rho)
        self.z = torch.where(self.masks, self.table, x + self.u)
        self.u = self.u + x - self.z
        return x

    def advance(self, steps: int) -> None:
        for _ in range(steps):
            self.step()

    def measure(self) -> list[Completion]:
        hidden = ~self.masks
        nuclear = torch.linalg.svdvals(self.z).sum(-1)
        miss = ((self.z - self.table).abs() * hidden).flatten(1).norm(dim=1)
        count = hidden.flatten(1).sum(1).clamp(min=1).to(miss.dtype)
        whole = self.table.abs().flatten(1).norm(dim=1)
        unseen = (self.table.abs() * hidden).flatten(1).norm(dim=1).clamp(min=1e-30)
        rows = zip(nuclear.tolist(), (miss / count.sqrt()).tolist(), (miss / whole).tolist(), (miss / unseen).tolist())
        return [Completion(*row) for row in rows]

    def keep(self, indices: Sequence[int]) -> None:
        index = torch.tensor(list(indices), dtype=torch.long, device=self.masks.device)
        self.masks, self.table = self.masks[index], self.table[index]
        self.z, self.u = self.z[index], self.u[index]


class TorchADMM:
    """The solver of model M, on the CPU unless told otherwise: for these tiny complex matrices
    the CPU is much faster than a laptop GPU. 200 steps on the 27 068 rigid tight-Hall patterns
    of a 4 x 4 table took 30 s on the CPU and 555 s on an RTX 3050 (2026-10-29)."""

    def __init__(self, device: str | None = None) -> None:
        self.device = device or "cpu"

    def start(self, patterns: Sequence[Pattern], a: Sequence[complex], b: Sequence[complex]) -> TorchRun:
        masks = torch.tensor(patterns, dtype=torch.bool, device=self.device)
        table = torch.outer(torch.tensor(a, dtype=torch.complex128), torch.tensor(b, dtype=torch.complex128))
        return TorchRun(masks, table.to(self.device).expand(len(patterns), -1, -1).clone())

    def start_tables(self, pattern: Pattern, tables: Sequence[tuple[Sequence[complex], Sequence[complex]]]) -> TorchRun:
        masks = torch.tensor([pattern] * len(tables), dtype=torch.bool, device=self.device)
        a = torch.tensor([list(a) for a, _ in tables], dtype=torch.complex128)
        b = torch.tensor([list(b) for _, b in tables], dtype=torch.complex128)
        return TorchRun(masks, (a.unsqueeze(-1) * b.unsqueeze(-2)).to(self.device))

    def fill(self, table: Sequence[Sequence[complex]], pattern: Pattern, checkpoints: Sequence[int],
             tol: float) -> Iterator[Fill]:
        run = TorchRun(torch.tensor(pattern, dtype=torch.bool, device=self.device),
                       torch.tensor(table, dtype=torch.complex128, device=self.device))
        done, residuals = 0, (math.inf, math.inf)
        for stop in checkpoints:
            while done < stop:
                before = run.z
                x = run.step()
                done += 1
                residuals = (torch.linalg.norm(x - run.z).item(), torch.linalg.norm(run.z - before).item())
                if residuals[0] < tol and residuals[1] < tol:
                    yield self._fill(run.z, done, residuals)
                    return
            yield self._fill(run.z, done, residuals)

    def nuclear_norm(self, table: Sequence[Sequence[complex]]) -> float:
        return torch.linalg.svdvals(torch.tensor(table, dtype=torch.complex128)).sum().item()

    @staticmethod
    def _fill(z: torch.Tensor, done: int, residuals: tuple[float, float]) -> Fill:
        return Fill(z.cpu().tolist(), torch.linalg.svdvals(z).sum().item(), done, residuals)
