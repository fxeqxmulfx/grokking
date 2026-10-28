# Recovery

**The question.** Model M fills a table `K` from the cells `Ω` it keeps with the matrix of
least nuclear norm that agrees with `K` on `Ω`. For a table of rank one, `K = a bᵀ`, the
transformer repository proves when M gives `K` back (`Transformer.Grokking.FlatSpectrum`):

- **Theorem E** (`forall_isMinOn_vecMulVec_iff`), entries of modulus one: exactly when `Ω` is
  rigid (its cells connect the rows to the columns) and contains a permutation;
- **Theorem F** (`forall_isMinOn_vecMulVec_iff_of_ne_zero`), no zero entry: exactly when `Ω`
  is rigid and every set of rows `R` has `Σ_R |a_i|²/‖a‖² ≤ Σ_N(R) |b_j|²/‖b‖²` (Gale);
- **Theorem G** (`forall_isMinOn_vecMulVec_iff_support`), zero entries allowed: the same, with
  rigidity asked only on the rows and columns where `a` and `b` are not zero.

These checks solve M by ADMM on every pattern of small tables at once, sort the patterns into
the classes a theorem names, and compare.

```sh
uv run --locked recovery equal 3 20000               # Theorem E, 3 × 3
uv run --locked recovery equal 4 20000               # Theorem E, 4 × 4: about two hours
uv run --locked recovery weighted 3 6000             # Theorem F
uv run --locked recovery zeros 30000                 # Theorem G, random moduli
uv run --locked recovery zeros 30000 --tight         # Theorem G, fixed moduli
uv run --locked recovery slow 4 20000 50000 100000 200000 400000
uv run --locked python -m unittest discover -s tests
```

Every check runs on the CPU unless `--device cuda` is given: for these tiny complex matrices
the CPU is much faster than a laptop GPU. 200 steps on the 27 068 rigid tight-Hall patterns of
a `4 × 4` table took 30 s on the CPU and 555 s on an RTX 3050.

## How the runs differ

| run | tables | patterns | entries | steps | error |
| --- | --- | --- | --- | --- | --- |
| `equal 3` | one 3 × 3 | 511: all but the full one | ones | 20 000 | `‖X − K‖/‖K‖` off `Ω` |
| `equal 4` | one 4 × 4 | 65 535 | ones | 20 000 | `‖X − K‖/‖K‖` off `Ω` |
| `weighted 3` | three 3 × 3 | the 510 nonempty ones of each | moduli uniform in [0.3, 2], random phases, seed 0 | 6000 | `‖X − K‖/‖K‖` off `Ω` |
| `zeros` | nine: 2 × 3, 3 × 2, 3 × 3, 2 × 4, 3 × 4, eight of them with zeros at fixed places | 6583 | moduli uniform in [0.3, 2], random phases, seed 0 | 30 000 | `‖X − K‖` off `Ω` over `‖K‖` |
| `zeros --tight` | four: three 3 × 3, one 3 × 4 | 5628 | the moduli of `TIGHT_MODULI`, random phases, seed 0 | 30 000 | `‖X − K‖` off `Ω` over `‖K‖` |
| `slow 4` | one 4 × 4 | the 27 068 rigid ones with a tight Hall condition; after the first checkpoint, those with error above `10⁻⁶` | ones | up to 400 000 | `‖X − K‖/‖K‖` off `Ω` |

`TIGHT_MODULI` (`application/sweeps.py`) are `|a| = (1, 1, 0)` with `|b| = (1, 1, 0)` and with
`|b| = (1, 1, 1)`, `|a| = (2, 1, 0)` with `|b| = (1, 1, √3, 0)`, and `|a| = (1, √2, 0)` with
`|b| = (1, 0, √2)`. A tight Hall condition means that some proper set of rows `R` sees exactly
`|R|` columns; with room to spare, every one sees more.

ADMM: `X ← SVT_{1/ρ}(Z − U)`, `Z ← X + U` reset to `K` on `Ω`, `U ← U + X − Z`, with
`ρ = 1/√max(m, n)`. The checks report `Z`, which agrees with `K` on `Ω`: the gap is
`‖Z‖_S1 − ‖a‖ ‖b‖`, the error is that of `Z`, and recovered means an error below `10⁻⁶`. A
negative gap shows a completion cheaper than `K`, so M does not recover `K`.

## What they found

Every class behaves as the theorems say. The ranges are those this package printed on
2026-10-29, to three digits; the `4 × 4` sweep is the first run's (below). The first runs, on
2026-10-28, were scripts in a session scratchpad (`small.py`, `weighted.py`, `zeros_check.py`)
with the same iteration and the same seeds. They printed the same counts and the same errors;
gaps at the level of rounding, below `5·10⁻¹⁵`, differ in the last bits.

Theorem E, `3 × 3`:

| class | patterns | gap | error |
| --- | --- | --- | --- |
| rigid, Hall with room to spare | 33 | 4.44e-16 to 2.22e-15 | 0 to 8.41e-16 |
| rigid, Hall tight | 162 | −4.44e-16 to 4.44e-15 | 0 to 4.73e-14 |
| rigid, no permutation | 9 | −0.172 | 0.500 |
| not rigid, a permutation | 51 | −4.44e-16 to 8.88e-16 | 0.894 to 1.00 |
| not rigid, no permutation | 256 | −3.00 to −0.172 | 0.775 to 1.00 |

Theorem E, `4 × 4`, from `small.py 4 20000` of 2026-10-28 (real arithmetic, on the GPU, five
hours):

| class | patterns | gap | error |
| --- | --- | --- | --- |
| rigid, Hall with room to spare | 6784 | −1.07e-14 to 3.91e-14 | 0 to 1.02e-14 |
| rigid, Hall tight | 27 068 | −1.20e-14 to 6.62e-7 | 1.39e-16 to 8.46e-5 |
| rigid, no permutation | 2464 | −0.536 to −0.136 | 0.345 to 0.667 |
| not rigid, a permutation | 3970 | −9.77e-15 to 1.60e-14 | 0.775 to 1.00 |
| not rigid, no permutation | 25 249 | −4.00 to −0.136 | 0.632 to 1.00 |

Theorem F, `3 × 3`, the same counts in each of the three draws (gaps and errors over all
three):

| class | patterns | gap | error |
| --- | --- | --- | --- |
| rigid, plan | 90 | −1.78e-15 to 6.22e-15 | 5.00e-17 to 1.76e-15 |
| rigid, no plan | 114 | −1.63 to −2.96e-6 | 1.67e-3 to 0.878 |
| not rigid, no plan | 306 | −6.16 to −2.97e-6 | 0.436 to 1.00 |

Theorem G, all tables of each run:

| moduli | class | patterns | recovered | gap | error |
| --- | --- | --- | --- | --- | --- |
| random | rigid, condition | 790 | 790 | −8.88e-16 to 3.55e-15 | 0 to 4.74e-16 |
| random | rigid, no condition | 1118 | 0 | −2.86 to −3.52e-4 | 0.0171 to 0.905 |
| random | not rigid, no condition | 4675 | 0 | −5.11 to −3.52e-4 | 0.151 to 1.00 |
| fixed | rigid, condition | 1220 | 1220 | −1.78e-15 to 8.88e-16 | 0 to 7.10e-16 |
| fixed | not rigid, condition | 224 | 0 | −1.78e-15 to −4.44e-16 | 0.566 to 0.707 |
| fixed | rigid, no condition | 464 | 0 | −1.00 to −0.0353 | 0.169 to 0.600 |
| fixed | not rigid, no condition | 3720 | 0 | −5.00 to −0.0353 | 0.447 to 1.00 |

No random draw gives a pattern that meets the condition without rigidity. The fixed moduli do,
and there `Z` has the least norm `‖a‖ ‖b‖` without being `K`: M has a second solution.
