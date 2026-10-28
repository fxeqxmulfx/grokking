"""Model M by ADMM in torch, on a batch of patterns at once.

min ‖X‖_S1 subject to X = K on the kept cells, split as X = Z with Z in the affine set:
X ← SVT_{1/ρ}(Z − U), Z ← X + U with the kept cells reset to K, U ← U + X − Z, from Z = K on
the kept cells and 0 elsewhere, U = 0, and ρ = 1/√max(m, n). Ported from the scripts `small.py`,
`weighted.py` and `zeros_check.py` of the first checks, which used this iteration.
"""

import math
from collections.abc import Sequence

import torch

from recovery.application.ports import Completion
from recovery.domain.patterns import Pattern


class TorchRun:
    def __init__(self, masks: torch.Tensor, table: torch.Tensor) -> None:
        self.masks, self.table = masks, table
        self.rho = 1.0 / math.sqrt(max(table.shape[-2:]))
        self.z = torch.where(masks, table, torch.zeros_like(table))
        self.u = torch.zeros_like(table)

    def advance(self, steps: int) -> None:
        for _ in range(steps):
            left, s, right = torch.linalg.svd(self.z - self.u, full_matrices=False)
            x = (left * torch.clamp(s - 1.0 / self.rho, min=0.0).to(self.table.dtype).unsqueeze(-2)) @ right
            self.z = torch.where(self.masks, self.table, x + self.u)
            self.u = self.u + x - self.z

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
