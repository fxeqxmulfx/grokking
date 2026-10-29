"""The tables of residues mod a prime p that the checks fill: a task f(a, b) mod p read through
ψ(x) = e^{2πi x/p}, a faithful multiplicative character χ, extended by χ(0) = 0, the powers
(a + b)^m read through Gaussian periods, and the interval [a + b < (p − 1)/2] read as 0 and 1."""

import cmath
import math
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


def roots_of_unity(p: int, m: int) -> list[int]:
    """The residues ζ with ζ^m = 1 mod the prime p: d = gcd(m, p − 1) of them."""
    return [z for z in range(1, p) if pow(z, m, p) == 1]


def period_readout(p: int, m: int) -> dict[int, complex]:
    """The Gaussian periods ρ(c^m) = Σ_{ζ^m = 1} e^{2πi ζc/p}, for every value c^m of x ↦ x^m.

    ρ(c^m) does not depend on the root c, since the roots of c^m ≠ 0 are the ζc, and ρ(0) = d.
    ρ is injective, because the e^{2πi t/p}, 0 < t < p, are linearly independent over ℚ and the
    cosets ζc are disjoint; ρ((a + b)^m) = Σ_ζ ψ(ζa) ψ(ζb) has rank d = gcd(m, p − 1), and no
    injective readout of (a + b)^m has a smaller one, since its Fourier transform takes one value
    on each coset kζ (hand)."""
    zetas = roots_of_unity(p, m)
    readout: dict[int, complex] = {}
    for c in range(p):
        if pow(c, m, p) not in readout:
            readout[pow(c, m, p)] = sum(cmath.exp(2j * math.pi * z * c / p) for z in zetas)
    return readout


def period_table(p: int, m: int) -> list[list[complex]]:
    """ρ((a + b)^m) for every cell (a, b) of the p x p table, ρ the Gaussian periods."""
    readout = period_readout(p, m)
    return [[readout[pow(a + b, m, p)] for b in range(p)] for a in range(p)]


def interval_table(p: int) -> list[list[complex]]:
    """[a + b mod p < (p − 1)/2], 1 or 0, for every cell (a, b): the training experiment's
    `sum-interval`. Its Fourier coefficients Σ_{c < (p − 1)/2} e^{−2πi kc/p} are all nonzero, so it
    has rank p (hand)."""
    return [[complex((a + b) % p < (p - 1) // 2) for b in range(p)] for a in range(p)]
