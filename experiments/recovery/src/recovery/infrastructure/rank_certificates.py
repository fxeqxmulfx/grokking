"""The certificate of *Rank above one*, item 1, in torch (`le_nuclearNorm_add_of_certificate`,
`isMinOn_iff_of_certificate` in the transformer repository), for a table K of rank r and a
pattern Ω. A full singular value decomposition gives unitary [U U⊥] and [V V⊥] with K = U diag(s)
Vᴴ; T is the space of the matrices U Aᴴ + B Vᴴ.

- Injectivity: the least singular value of h ↦ h on Ω over T, in the orthonormal basis
  u_a v_bᴴ of T, a < r or b < r. It is 0 exactly when a nonzero U Aᴴ + B Vᴴ vanishes on Ω.
- The certificate: W = U⊥ G V⊥ᴴ, so that Uᴴ W = 0 and W V = 0, with W = −U Vᴴ off Ω, so that
  Y = U Vᴴ + W vanishes there; ‖W‖_op = ‖G‖_op. The pseudoinverse gives the G of least
  Frobenius norm, which is the Y of least Frobenius norm, as T and its complement are
  orthogonal. Projected subgradient descent on ‖G‖_op over the solutions then looks for a
  smaller one, as `TorchCertificates.best` does for Theorem D.
- Item 5 on a solver's dual Y and completion Z (`dual`): Ŷ = Y / max(1, ‖Y‖_op) is a
  contraction, so Re tr(Ŷᴴ K) ≤ ‖K‖_S1, with equality exactly when Ŷ certifies K
  (`isMinOn_iff_exists_isContraction`); then Ŷ = U Vᴴ + W with Uᴴ W = 0, W V = 0 and W a
  contraction (`isContraction_trace_eq_iff`).
"""

from collections.abc import Sequence

import torch

from recovery.application.ports import DualCheck, RankCertificate
from recovery.domain.patterns import Pattern

#: The equations for W hold to this, entry by entry, when a W exists; |U Vᴴ| ≤ 1 entrywise.
FEASIBLE = 1e-9


class TorchRankCertificates:
    def certificate(self, table: Sequence[Sequence[complex]], pattern: Pattern, rank: int,
                    steps: int) -> RankCertificate:
        k = torch.tensor(table, dtype=torch.complex128)
        kept = torch.tensor(pattern, dtype=torch.bool)
        m, n = k.shape
        left, _, right_h = torch.linalg.svd(k)
        right = right_h.mH
        pairs = [(a, b) for a in range(m) for b in range(n) if a < rank or b < rank]
        basis = torch.stack([torch.outer(left[:, a], right[:, b].conj())[kept] for a, b in pairs])
        injectivity = torch.linalg.svdvals(basis)[-1].item() if basis.shape[1] >= len(pairs) else 0.0
        hidden = ~kept
        p, q = m - rank, n - rank
        if not bool(hidden.any()) or p * q == 0:
            rhs = -(left[:, :rank] @ right[:, :rank].mH)[hidden]
            violation = rhs.abs().max().item() if rhs.numel() else 0.0
            known = 0.0 if violation <= FEASIBLE else None
            return RankCertificate(injectivity, known, known, violation)
        rhs = -(left[:, :rank] @ right[:, :rank].mH)[hidden]
        a = torch.einsum("ia,jb->ijab", left[:, rank:], right[:, rank:].conj())[hidden].reshape(-1, p * q)
        inverse = torch.linalg.pinv(a)
        g = inverse @ rhs
        violation = (a @ g - rhs).abs().max().item()
        if violation > FEASIBLE:
            return RankCertificate(injectivity, None, None, violation)
        least = torch.linalg.matrix_norm(g.reshape(p, q), ord=2).item()
        best = least
        if least >= 1 and injectivity > 0:
            for t in range(steps):
                u, s, vh = torch.linalg.svd(g.reshape(p, q), full_matrices=False)
                best = min(best, s[0].item())
                top = int((s > s[0] - 1e-9).sum())
                g = g - 0.5 / (1 + t) ** 0.5 * (u[:, :top] @ vh[:top, :] / top).reshape(-1)
                g = g - inverse @ (a @ g - rhs)
            best = min(best, torch.linalg.matrix_norm(g.reshape(p, q), ord=2).item())
            violation = (a @ g - rhs).abs().max().item()
        return RankCertificate(injectivity, least, best, violation)

    def dual(self, table: Sequence[Sequence[complex]], pattern: Pattern, rank: int,
             completion: Sequence[Sequence[complex]], dual: Sequence[Sequence[complex]]) -> DualCheck:
        k, z, y = (torch.tensor(x, dtype=torch.complex128) for x in (table, completion, dual))
        hidden = ~torch.tensor(pattern, dtype=torch.bool)
        left, s, right_h = torch.linalg.svd(k)
        u, v = left[:, :rank], right_h.mH[:, :rank]
        polar = u @ v.mH
        norm = torch.linalg.matrix_norm(y, ord=2).item()
        off = y[hidden].abs().max().item() if bool(hidden.any()) else 0.0
        y = y / max(1.0, norm)
        polar_off = polar[hidden].abs().max().item() if bool(hidden.any()) else 0.0
        pairing = (y.conj() * k).sum().real.item()
        m, n = k.shape
        pi = torch.eye(m, dtype=k.dtype) - u @ u.mH
        pi_right = torch.eye(n, dtype=k.dtype) - v @ v.mH
        spread = torch.linalg.svdvals(pi @ (z - k) @ pi_right).sum().item()
        return DualCheck(norm, off, s.sum().item() - pairing, torch.linalg.norm(y @ v - u).item(),
                         torch.linalg.norm(y.mH @ u - v).item(), torch.linalg.matrix_norm(y - polar, ord=2).item(),
                         polar_off, spread)
