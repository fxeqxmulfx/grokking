"""The training split of `grok-simple.py` (`~/rust_projects/grokking_abmod/scripts`), reproduced
exactly: the rows (a, b) of a p x p table listed a-major, shuffled by SplitMix64 seeded with
`seed ^ 0x73706C6974730002`, and the first ⌊p² · fraction⌋ of them kept for training."""

import math

from recovery.domain.patterns import Pattern

MASK64 = (1 << 64) - 1


class SplitMix64:
    """The generator of `grok-simple.py` (`Random` in mesh-gpt's `src/mesh.rs`)."""

    def __init__(self, seed: int) -> None:
        self.state = seed & MASK64

    def next(self) -> int:
        self.state = (self.state + 0x9E3779B97F4A7C15) & MASK64
        value = self.state
        value = ((value ^ (value >> 30)) * 0xBF58476D1CE4E5B9) & MASK64
        value = ((value ^ (value >> 27)) * 0x94D049BB133111EB) & MASK64
        return value ^ (value >> 31)

    def index(self, bound: int) -> int:
        """Uniform in range(bound), by rejection of the values below 2⁶⁴ mod bound."""
        threshold = (1 << 64) % bound
        while True:
            value = self.next()
            if value >= threshold:
                return value % bound

    def shuffle(self, values: list) -> None:
        """Fisher–Yates from the end, in place."""
        for end in range(len(values) - 1, 0, -1):
            index = self.index(end + 1)
            values[end], values[index] = values[index], values[end]


def training_pattern(p: int, seed: int, fraction: float = 0.5) -> Pattern:
    """The cells (a, b) that `grok-simple.py` trains on, for the given split seed."""
    rows = [(a, b) for a in range(p) for b in range(p)]
    SplitMix64(seed ^ 0x73706C6974730002).shuffle(rows)
    kept = set(rows[:math.floor(len(rows) * fraction)])
    return tuple(tuple((a, b) in kept for b in range(p)) for a in range(p))
