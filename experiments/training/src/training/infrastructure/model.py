"""The course's network: grok-simple's Rotate90 model with SwiGLU and Peri-RMSNorm.

Ported from grokking_abmod's `scripts/grok-simple.py` (`Rotate90`, `normal`, `uniform`, `norm`),
unchanged: one table E embeds a and b and reads out the answer; J turns each channel pair of
E[b] by 90°, (x₁, x₂) ↦ (−x₂, x₁);

    x = n(E[a] + J E[b]),   x ← x + n(SwiGLU(n(x))) per block,   logits = n(x) Eᵀ,

with n an RMSNorm without parameters (float32 machine epsilon), SwiGLU(x) = (SiLU(x W_g) ⊙ x W_v) W_o,
no biases. The weights come from the seeded SplitMix64 stream in grok-simple's order: E uniform
fan-in, U(±1/√p), then each block's W_g and W_v from N(0, 0.02) and W_o from N(0, 0.02/√(2 depth)).
"""

import math

import torch
from torch import nn
from torch.nn import functional as F

from training.domain.tasks import SplitMix64


def normal(random: SplitMix64, shape: tuple[int, int], deviation: float) -> torch.Tensor:
    """Box–Muller normals in grok-simple's order: the f64 cosine, then the sine, of each pair."""
    count = math.prod(shape)
    values: list[float] = []
    while len(values) < count:
        radius = math.sqrt(-2.0 * math.log(1.0 - random.unit()))
        angle = math.tau * random.unit()
        values += (deviation * radius * math.cos(angle), deviation * radius * math.sin(angle))
    return torch.tensor(values[:count], dtype=torch.float32).view(shape)


def uniform(random: SplitMix64, shape: tuple[int, int]) -> torch.Tensor:
    """grok-simple's uniform fan-in weights, (2u − 1)/√fan_in, in float32."""
    bound = 1 / torch.tensor(float(shape[0])).sqrt()
    units = torch.tensor([random.unit() for _ in range(math.prod(shape))], dtype=torch.float32)
    return ((2 * units - 1) * bound).view(shape)


def norm(x: torch.Tensor) -> torch.Tensor:
    """RMSNorm without parameters, with the float32 machine epsilon."""
    return F.rms_norm(x, (x.size(-1),))


class Rotate90(nn.Module):
    """One embedding for a, b and the readout; SwiGLU residual blocks between them.

    Weights are stored input-major: activations multiply them from the left. `gate_value` holds
    W_g, then W_v, side by side.
    """

    def __init__(self, modulus: int, width: int, depth: int, hidden: int, seed: int) -> None:
        super().__init__()
        if width < 2 or width % 2:
            raise ValueError("the width must be even: J turns channel pairs")
        random = SplitMix64(seed ^ 0x73696D706C650004)
        self.embedding = nn.Parameter(uniform(random, (modulus, width)))
        self.gate_value, self.output = nn.ParameterList(), nn.ParameterList()
        for _ in range(depth):
            self.gate_value.append(normal(random, (width, 2 * hidden), 0.02))
            self.output.append(normal(random, (hidden, width), 0.02 / math.sqrt(2 * depth)))

    def forward(self, a: torch.Tensor, b: torch.Tensor) -> torch.Tensor:
        table = self.embedding
        pairs = table[b].unflatten(-1, (-1, 2))
        x = norm(table[a] + torch.stack((-pairs[..., 1], pairs[..., 0]), dim=-1).flatten(-2))
        for gate_value, output in zip(self.gate_value, self.output):
            gate, value = (norm(x) @ gate_value).chunk(2, dim=-1)
            x = x + norm((F.silu(gate) * value) @ output)
        return norm(x) @ table.T
