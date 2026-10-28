"""Random numbers from torch's generator, so that a seed gives the draws of the first checks."""

import torch


class TorchDraws:
    def __init__(self, seed: int) -> None:
        self.generator = torch.Generator().manual_seed(seed)

    def uniform(self, count: int) -> list[float]:
        return torch.rand(count, generator=self.generator, dtype=torch.float64).tolist()
