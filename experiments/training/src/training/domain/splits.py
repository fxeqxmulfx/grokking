"""The seeded split of a task's table and the minibatch order, as in grokking_abmod's
`scripts/grok-simple.py` (`Equations` and `Sampler`), which follow mesh-gpt's
`EquationDataset` in `src/gpt/grokking.rs`.

The symbol permutation of grok-simple only fills the token columns of its equations.csv and does
not touch the split, so it is left out.
"""

import math
from dataclasses import dataclass

from training.domain.tasks import SplitMix64, first_column, table

Row = tuple[int, int, int]


@dataclass(frozen=True)
class Split:
    """The equations (a, b, f(a, b)) seen in training and the ones held out."""

    train: tuple[Row, ...]
    validation: tuple[Row, ...]


def split(name: str, p: int, train_fraction: float, seed: int) -> Split:
    """Shuffle every equation with the seed and keep the first ⌊count · fraction⌋ for training."""
    if not 0 < train_fraction < 1:
        raise ValueError("the train fraction must lie strictly between 0 and 1")
    answers, start = table(name, p), first_column(name)
    rows = [(a, b, answers[a][b - start]) for a in range(p) for b in range(start, p)]
    count = math.floor(len(rows) * train_fraction)
    if not 2 <= count < len(rows):
        raise ValueError("the split needs two training equations and one validation equation")
    SplitMix64(seed ^ 0x73706C6974730002).shuffle(rows)
    return Split(tuple(rows[:count]), tuple(rows[count:]))


class Sampler:
    """Shuffled epochs without replacement; the last minibatch of an epoch may be shorter."""

    def __init__(self, count: int, seed: int) -> None:
        self.random = SplitMix64(seed ^ 0x6261746368657303)
        self.order = list(range(count))
        self.random.shuffle(self.order)
        self.position = 0

    def sample(self, batch: int) -> list[int]:
        if self.position == len(self.order):
            self.random.shuffle(self.order)
            self.position = 0
        start = self.position
        self.position = min(len(self.order), start + batch)
        return self.order[start:self.position]
