"""The tables of residues mod a prime p that the checks fill: a task f(a, b) mod p read through
ψ(x) = e^{2πi x/p}, and a faithful multiplicative character χ, extended by χ(0) = 0."""

from collections.abc import Callable

type Task = Callable[[int, int], int]

#: The tasks of `review/flat_spectrum.md`: ψ(a + b) is rank one, ψ(a³ + a b) has
#: ‖K‖_S1 = p^{3/2} (Theorem A).
TASKS: dict[str, Task] = {"a+b": lambda a, b: a + b, "a^3+ab": lambda a, b: a ** 3 + a * b}


def values(p: int, task: Task) -> list[list[int]]:
    """f(a, b) mod p for every cell (a, b) of the p x p table."""
    return [[task(a, b) % p for b in range(p)] for a in range(p)]


def is_prime(n: int) -> bool:
    return n >= 2 and all(n % d for d in range(2, int(n ** 0.5) + 1))


def primitive_root(p: int) -> int:
    """The least g whose powers run through every nonzero residue mod the prime p."""
    factors = [q for q in range(2, p) if (p - 1) % q == 0 and is_prime(q)]
    return next(g for g in range(2, p) if all(pow(g, (p - 1) // q, p) != 1 for q in factors))


def discrete_log(p: int) -> list[int | None]:
    """k with g^k = x for every residue x, g the primitive root; None at x = 0. The character
    χ(x) = e^{2πi k/(p − 1)} is faithful: it takes each (p − 1)-th root of unity once."""
    g, log, x = primitive_root(p), [None] * p, 1
    for k in range(p - 1):
        log[x] = k
        x = x * g % p
    return log
