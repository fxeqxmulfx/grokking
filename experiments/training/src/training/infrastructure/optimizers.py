"""Schedule-Free AdamW, the optimizer of the course's network.

Ported from the transformer repository's `optimizers/src/lean_optim/schedule_free_adamw.py`
(commit fa68daf7), itself facebookresearch/schedule_free at commit 59ed9b66, the version 1.3
stability revision (`adamw_schedulefree.py` of 1.4.1 is identical). The recurrence is unchanged.
Deviations from lean_optim: a plain `torch.optim.Optimizer` without its reusable workspace, so
each step allocates its temporaries; no checkpoint compatibility checks.

With rate = lr · min(1, t/warmup), m = max(previous m, rate), c = m²/Σ m² and
u = g/(√(v/(1 − β₂ᵗ)) + ε) + weight_decay · y, a step does
y ← y + c (z − y) + rate (β₁ (1 − c) − 1) u and z ← z − rate · u, from the old y and z.
The parameters hold y while training; `eval()` moves them to the average x = y + (1 − 1/β₁)(z − y),
and `train()` moves them back.
"""

from collections.abc import Callable, Iterable

import torch


class ScheduleFreeAdamW(torch.optim.Optimizer):
    def __init__(self, params: Iterable[torch.Tensor], lr: float = 1e-3,
                 betas: tuple[float, float] = (0.9, 0.999), weight_decay: float = 0.0,
                 eps: float = 1e-8, warmup: int = 0) -> None:
        if not 0 < betas[0] < 1 or not 0 <= betas[1] < 1:
            raise ValueError("beta1 must lie in (0, 1) and beta2 in [0, 1)")
        if warmup < 0:
            raise ValueError("warmup must be nonnegative")
        super().__init__(params, {"lr": lr, "betas": betas, "weight_decay": weight_decay, "eps": eps,
                                  "warmup": warmup, "training": True, "step": 0, "maximum": 0.0,
                                  "total": 0.0})
        if len(self.param_groups) != 1:
            raise ValueError("ScheduleFreeAdamW supports one parameter group")
        for p in self.param_groups[0]["params"]:
            self.state[p] = {"base": p.detach().clone(), "second": torch.zeros_like(p)}

    @torch.no_grad()
    def _mode(self, training: bool) -> "ScheduleFreeAdamW":
        group = self.param_groups[0]
        if group["training"] != training:
            beta1 = group["betas"][0]
            for p in group["params"]:
                p.lerp_(self.state[p]["base"], 1 - beta1 if training else 1 - 1 / beta1)
            group["training"] = training
        return self

    def train(self) -> "ScheduleFreeAdamW":
        """Move the parameters from the average x back to the training query y."""
        return self._mode(True)

    def eval(self) -> "ScheduleFreeAdamW":
        """Move the parameters from the training query y to the average x."""
        return self._mode(False)

    @torch.no_grad()
    def step(self, closure: Callable[[], torch.Tensor] | None = None) -> torch.Tensor | None:
        group = self.param_groups[0]
        if not group["training"]:
            raise RuntimeError("call train() before a training step")
        loss = None
        if closure is not None:
            with torch.enable_grad():
                loss = closure()
        beta1, beta2 = group["betas"]
        group["step"] += 1
        step = group["step"]
        rate = group["lr"] * (min(1.0, step / group["warmup"]) if group["warmup"] else 1.0)
        group["maximum"] = max(rate, group["maximum"])
        group["total"] += group["maximum"] ** 2
        coefficient = group["maximum"] ** 2 / group["total"] if group["total"] else 0.0
        for p in group["params"]:
            if p.grad is None:
                raise ValueError("ScheduleFreeAdamW needs a gradient for every parameter")
            state = self.state[p]
            state["second"].mul_(beta2).addcmul_(p.grad, p.grad, value=1 - beta2)
            work = (state["second"] / (1 - beta2**step)).sqrt_().add_(group["eps"])
            work = torch.div(p.grad, work).add_(p, alpha=group["weight_decay"])
            p.lerp_(state["base"], coefficient)
            p.add_(work, alpha=rate * (beta1 * (1 - coefficient) - 1))
            state["base"].sub_(work, alpha=rate)
        return loss
