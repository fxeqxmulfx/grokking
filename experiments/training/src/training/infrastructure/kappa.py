"""The peak κ by alternating maximization, in torch.

Ported from the scratch `kappa.py` of 2026-10-28, unchanged in method. Given ρ, (g, h) is the top
singular pair of the doubly centered kernel C(conj ρ(F)), by power iteration with a warm start;
given (g, h), ρ(c) is the phase of t_c = Σ_{f(a,b)=c} g(a) h(b). Neither step lowers the objective.
Starts: every additive character ψ_r, r ≠ 0, every nontrivial multiplicative character (by a
discrete logarithm, ρ(0) = 1), the parity readout e^{iπc}, 8 ramps e^{iπkc/(p−1)}, and 256 random
phases: 456 starts at p = 97. 600 rounds of 3 power steps, in complex64; the best ρ of each start
is then evaluated exactly, in complex128. Deviation from the scratch script: the random start
vectors of the power iteration come from torch's generator seeded with the table's seed, so a
rerun gives the same values.
"""

import math

import torch

from training.application.ports import Peak

ROUNDS, POWER, CHUNK, RANDOM = 600, 3, 192, 256


def primitive_root(p: int) -> int:
    """The least primitive root mod a prime p."""
    factors = [q for q in range(2, p) if (p - 1) % q == 0 and all(q % d for d in range(2, q))]
    return next((g for g in range(2, p) if all(pow(g, (p - 1) // q, p) != 1 for q in factors)), 1)


def center(M: torch.Tensor) -> torch.Tensor:
    """Subtract the row and column means of the last two axes, add back the total mean."""
    return M - M.mean(-2, keepdim=True) - M.mean(-1, keepdim=True) + M.mean((-2, -1), keepdim=True)


class TorchPeaks:
    def __init__(self, device: str) -> None:
        self.device = torch.device(device)

    def starts(self, p: int, seed: int) -> torch.Tensor:
        """The phases θ of the starting readouts ρ = e^{iθ}, one row per start."""
        dev = self.device
        c = torch.arange(p, device=dev, dtype=torch.float64)
        r = torch.arange(1, p, device=dev, dtype=torch.float64)
        blocks = [2 * math.pi * r[:, None] * c[None, :] / p]
        g, log, x = primitive_root(p), [0] * p, 1
        for k in range(p - 1):
            log[x] = k
            x = x * g % p
        L = torch.tensor(log, device=dev, dtype=torch.float64)
        j = torch.arange(1, p - 1, device=dev, dtype=torch.float64)
        multiplicative = 2 * math.pi * j[:, None] * L[None, :] / (p - 1)
        multiplicative[:, 0] = 0
        blocks += [multiplicative, math.pi * c[None, :]]
        k = torch.arange(1, 9, device=dev, dtype=torch.float64)
        blocks.append(math.pi * k[:, None] * c[None, :] / (p - 1))
        generator = torch.Generator(device=dev).manual_seed(seed)
        blocks.append(2 * math.pi * torch.rand(RANDOM, p, generator=generator, device=dev, dtype=torch.float64))
        return torch.cat(blocks)

    @staticmethod
    def exact_sigma(F: torch.Tensor, rho: torch.Tensor) -> torch.Tensor:
        """σ₁ of the doubly centered kernel conj ρ(F), in complex128, one per row of ρ."""
        return torch.linalg.matrix_norm(center(rho.to(torch.complex128).conj()[:, F]), ord=2)

    def optimize(self, F: torch.Tensor, p: int, theta: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """The exact σ₁ and the readout reached from each start."""
        m = F.shape[1]
        index = F.reshape(1, -1)
        sigmas, rhos = [], []
        for s0 in range(0, theta.shape[0], CHUNK):
            th = theta[s0:s0 + CHUNK]
            rho = torch.polar(torch.ones_like(th), th).to(torch.complex64)
            S = rho.shape[0]
            v = torch.randn(S, m, device=self.device, dtype=torch.complex64)
            for _ in range(ROUNDS):
                M = center(rho.conj()[:, F])
                for _ in range(POWER):
                    w = torch.einsum("snm,sm->sn", M, v)
                    v = torch.einsum("snm,sn->sm", M.conj(), w)
                    v = v / v.norm(dim=1, keepdim=True).clamp_min(1e-30)
                w = torch.einsum("snm,sm->sn", M, v)
                g = (w / w.norm(dim=1, keepdim=True).clamp_min(1e-30)).conj()
                outer = (g[:, :, None] * v[:, None, :]).reshape(S, -1)
                t = torch.zeros(S, p, device=self.device, dtype=torch.complex64).scatter_add_(
                    1, index.expand(S, -1), outer)
                size = t.abs()
                rho = torch.where(size > 1e-9, t / size.clamp_min(1e-30), rho)
            sigmas.append(self.exact_sigma(F, rho))
            rhos.append(rho)
        return torch.cat(sigmas), torch.cat(rhos)

    def peak(self, table: list[list[int]], p: int, seed: int) -> Peak:
        torch.manual_seed(seed)
        F = torch.tensor(table, device=self.device)
        size = F.numel()
        sigma, _ = self.optimize(F, p, self.starts(p, seed))
        kappas = sigma.square() / size
        best = int(kappas.argmax())
        kappa = float(kappas[best])
        r = torch.arange(1, p, device=self.device, dtype=torch.float64)
        c = torch.arange(p, device=self.device, dtype=torch.float64)
        psi = torch.polar(torch.ones(p - 1, p, device=self.device, dtype=torch.float64),
                          2 * math.pi * r[:, None] * c / p)
        kpsi = self.exact_sigma(F, psi).square() / size
        r_best = int(kpsi.argmax())
        return Peak(kappa, int((kappas > kappa - 1e-3).sum()), int(kappas.numel()), float(kpsi[r_best]), r_best + 1)
