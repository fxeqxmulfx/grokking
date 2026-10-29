"""The tasks f(a, b) on Z/p and their answer tables.

Ported from the scratch `tasks.py` of 2026-10-28 (the session that measured the peak κ and the
ten training predictions): the ten operations of grokking_abmod's `scripts/grok-simple.py`
(`OPERATIONS`), twelve more, and the two "blind" variants that drop the answer's lowest bit.
"""

from collections.abc import Callable

MASK64 = (1 << 64) - 1

Task = Callable[[int, int, int], int]


class SplitMix64:
    """mesh-gpt's seeded generator (`Random` in its `src/mesh.rs`), as in grok-simple.py."""

    def __init__(self, seed: int) -> None:
        self.state = seed & MASK64

    def next(self) -> int:
        self.state = (self.state + 0x9E3779B97F4A7C15) & MASK64
        value = self.state
        value = ((value ^ (value >> 30)) * 0xBF58476D1CE4E5B9) & MASK64
        value = ((value ^ (value >> 27)) * 0x94D049BB133111EB) & MASK64
        return value ^ (value >> 31)

    def unit(self) -> float:
        """A uniform value in [0, 1) with 24 random bits, exact in float32."""
        return (self.next() >> 40) / 16_777_216

    def index(self, bound: int) -> int:
        """A uniform integer below `bound`, without modulo bias."""
        threshold = (1 << 64) % bound
        while True:
            value = self.next()
            if value >= threshold:
                return value % bound

    def shuffle(self, values: list) -> None:
        for end in range(len(values) - 1, 0, -1):
            index = self.index(end + 1)
            values[end], values[index] = values[index], values[end]


def permutation(p: int) -> list[int]:
    """The fixed random permutation π of Z/p in `perm-add`."""
    values = list(range(p))
    SplitMix64(0x7065726D75746531).shuffle(values)
    return values


def random_table(p: int) -> list[list[int]]:
    """The fixed random answer table of `random`."""
    random = SplitMix64(0x72616E646F6D3031)
    return [[random.index(p) for _ in range(p)] for _ in range(p)]


def parity_cubic(a: int, b: int, p: int) -> int:
    """2 ⌊c/2⌋ + parity(a + b), c = a³ + ab mod p; the one overflow, p, wraps to 0."""
    c = (a**3 + a * b) % p
    return (2 * (c // 2) + (a + b) % 2) % p


LAB: dict[str, Task] = {
    "add": lambda a, b, p: (a + b) % p,
    "sub": lambda a, b, p: (a - b) % p,
    "mul": lambda a, b, p: a * b % p,
    "div": lambda a, b, p: a * pow(b, -1, p) % p,
    "mixed": lambda a, b, p: a * pow(b, -1, p) % p if b % 2 else (a - b) % p,
    "square-sum": lambda a, b, p: (a * a + b * b) % p,
    "quadratic": lambda a, b, p: (a * a + a * b + b * b) % p,
    "quadratic-linear": lambda a, b, p: (a * a + a * b + b * b + a) % p,
    "cubic-product": lambda a, b, p: (a**3 + a * b) % p,
    "cubic-mixed": lambda a, b, p: (a**3 + a * b * b + b) % p,
}

EXTRA: dict[str, Task] = {
    "half-sum": lambda a, b, p: (a + b) * pow(2, -1, p) % p,
    "perm-add": lambda a, b, p: permutation(p)[(a + b) % p],
    "cube-plus": lambda a, b, p: (a**3 + b) % p,
    "square-times": lambda a, b, p: a * a * b % p,
    "affine-product": lambda a, b, p: (a + a * b) % p,
    "abs-diff": lambda a, b, p: abs(a - b),
    "floor-product": lambda a, b, p: a * b // p,
    "max": lambda a, b, p: max(a, b),
    "sum-square": lambda a, b, p: (a + b) ** 2 % p,
    "sum-cube": lambda a, b, p: (a + b) ** 3 % p,
    "square-product": lambda a, b, p: (a * a + a * b) % p,
    "random": lambda a, b, p: random_table(p)[a][b],
    "parity-cubic": parity_cubic,
}

TASKS: dict[str, Task] = {**LAB, **EXTRA}

#: The two tasks whose answer's lowest bit is a strong mode; `<name>/blind` drops that bit.
BLIND = ("parity-cubic", "abs-diff")

FORMULA = {
    "add": "a + b", "sub": "a − b", "mul": "a·b", "div": "a / b",
    "mixed": "a/b (b odd), a−b (b even)", "square-sum": "a² + b²",
    "quadratic": "a² + ab + b²", "quadratic-linear": "a² + ab + b² + a",
    "cubic-product": "a³ + ab", "cubic-mixed": "a³ + ab² + b",
    "half-sum": "(a + b)/2", "perm-add": "π(a + b)", "cube-plus": "a³ + b",
    "square-times": "a²b", "affine-product": "a + ab", "abs-diff": "|a − b|",
    "floor-product": "⌊ab/p⌋", "max": "max(a, b)", "sum-square": "(a + b)²",
    "sum-cube": "(a + b)³", "square-product": "a² + ab", "random": "random table",
    "parity-cubic": "2⌊(a³+ab)/2⌋ + parity(a+b)",
}


def task(name: str) -> Task:
    """The task of a name; `<base>/blind` is ⌊f/2⌋ for a base in `BLIND`."""
    base, _, variant = name.partition("/")
    if variant == "blind" and base in BLIND:
        return lambda a, b, p: TASKS[base](a, b, p) // 2
    if variant:
        raise KeyError(name)
    return TASKS[name]


def first_column(name: str) -> int:
    """`div` is undefined at b = 0, so its table and its split start at column 1."""
    return int(name == "div")


def table(name: str, p: int) -> list[list[int]]:
    """The answer table [f(a, b)], rows a, columns b from `first_column(name)` on."""
    apply = task(name)
    if name == "perm-add":
        pi = permutation(p)
        return [[pi[(a + b) % p] for b in range(p)] for a in range(p)]
    if name == "random":
        return random_table(p)
    return [[apply(a, b, p) for b in range(first_column(name), p)] for a in range(p)]
