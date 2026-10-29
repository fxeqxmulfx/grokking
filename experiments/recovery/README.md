# Recovery

**The question.** Model M fills a table `K` from the cells `Ω` it keeps with the matrix of
least nuclear norm that agrees with `K` on `Ω`. The transformer repository proves when M gives
`K` back (`Transformer.Grokking.FlatSpectrum`, written out in its `review/flat_spectrum.md`).
For a table of rank one, `K = a bᵀ`:

- **Theorem E** (`forall_isMinOn_vecMulVec_iff`), entries of modulus one: exactly when `Ω` is
  rigid (its cells connect the rows to the columns) and contains a permutation;
- **Theorem F** (`forall_isMinOn_vecMulVec_iff_of_ne_zero`), no zero entry: exactly when `Ω`
  is rigid and every set of rows `R` has `Σ_R |a_i|²/‖a‖² ≤ Σ_N(R) |b_j|²/‖b‖²` (Gale). On
  the cross of row `i₀` and column `j₀` this reads `|a_i₀|²/‖a‖² + |b_j₀|²/‖b‖² ≥ 1`
  (`forall_isMinOn_vecMulVec_cross_iff`);
- **Theorem G** (`forall_isMinOn_vecMulVec_iff_support`), zero entries allowed: the same, with
  rigidity asked only on the rows and columns where `a` and `b` are not zero. With moduli one
  there, the condition is a bijection between these rows and columns inside `Ω`
  (`forall_isMinOn_vecMulVec_iff_equiv_support`).
- **The failure margin**, ones on an `N × N` table: off a `k × l` block with `k + l > N` the
  least norm is `√(k (N − l)) + √(l (N − k))` (`isLeast_nuclearNorm_compl_block_card`), and
  the cells off it contain no permutation. Every `Ω` without a permutation has a completion of
  norm at most `√(N² − 1) < N − 1/(2N)` (`exists_nuclearNorm_le_sqrt_of_not_perm`). For
  `N ≥ 1` and `a + b = N + 1` with `a ≤ b ≤ a + 1`, every such `Ω` has one of norm at most
  `√(a (a − 1)) + √(b (b − 1))`, and some such `Ω` has it as least norm (`failureMargin`).

On `p × p` tables at a prime `p`, with `ψ(x) = e^{2πix/p}`:

- `ψ(a + b) = ψ(a) ψ(b)` has moduli one, so M gives it back exactly when `Ω` connects the rows
  to the columns and contains a permutation (`forall_isMinOn_addKernel_iff_connected`).
- **Theorem D** certifies recovery from a rigid `Ω` by a `Y` that vanishes off `Ω`, has unit
  row and column sums and makes `c (Y − J/p)` a contraction for some `c > 1`
  (`isMinOn_onesMatrix_iff`). Two diagonals `b = a + s₁` and `b = a + s₂`, `s₁ ≠ s₂`, carry
  `Y = (P₁ + P₂)/2` with `c = √(1 + 1/(4p²))` (`isContraction_permAvg`). A row with a single
  cell leaves no `c > 1` (`not_isContraction_of_row`); still, two diagonals minus any one cell,
  with or without more cells, give `ψ(a + b)` back
  (`forall_isMinOn_addKernel_of_diagonals_diff_of_ne`).
- `ψ(a³ + a b)` has all its singular values equal, and M gives it back from no `Ω` but the
  whole table (`not_isMinOn_cubicKernel`).
- `χ(ab)` and `χ(a + ab)`, for a faithful multiplicative character `χ` with `χ(0) = 0`, are
  rank one with a zero row and a zero column: Theorem G with moduli one on the supports.
- `(a + b)^m` read through the Gaussian periods `ρ(c^m) = Σ_{ζ^m = 1} ψ(ζc)` has rank
  `d = gcd(m, p − 1)`, the least rank of an injective readout of `(a + b)^m` (hand,
  `period_readout` in `domain/residues.py`). For `d > 1` no theorem here says from which `Ω` M
  recovers it.

Above rank one (*Rank above one*, added to the review):

- **The certificate** (`isMinOn_iff_of_certificate`): write `K = U S Vᴴ` with orthonormal
  columns in `U` and in `V` and `S` diagonal with entries `≥ 0` (`svd_hypotheses`). M recovers
  `K` if some `W` with `Uᴴ W = 0`, `W V = 0` and `‖W‖_op < 1` makes `U Vᴴ + W` vanish off `Ω`,
  and no nonzero `U Aᴴ + B Vᴴ` vanishes on `Ω`.
- **The necessary condition** (`reachable_of_forall_isMinOn`): if M recovers `K`, the cells of
  `Ω` where `K ≠ 0`, as edges between rows and columns, join the row and the column of every
  nonzero entry.
- **Three cells** (`isMinOn_threeCells_iff`, `forall_isMinOn_threeCells_iff`): from the cells
  of a `2 × 2` table other than `(0, 1)`, M's only minimum puts
  `x* = conj(k₁₀) k₀₀ k₁₁ / max(|k₁₀|², |k₀₀ k₁₁|)` at `(0, 1)`, and `0` when
  `k₁₀ = k₀₀ k₁₁ = 0`, so M recovers `K` exactly when `k₀₁ = x*`. With `det K ≠ 0` this reads
  `k₀₁ = conj(k₁₀) det K / |det K|`, and a nonzero `U Aᴴ + B Vᴴ` vanishes on the three cells
  (`exists_ne_zero_threeCells_of_det_ne_zero`); yet `[[2, 1], [1, 1]]` is recovered, so the
  certificate's second condition is not necessary.
- **The minimum** (`isMinOn_iff_exists_isContraction`, `isContraction_trace_eq_iff`,
  `isMinOn_iff_exists_certificate`, `isMinOn_iff_of_full_rank`): `K` is a minimum of M, not
  necessarily the only one, exactly when some contraction `Y` (`‖Y‖_op ≤ 1`) that vanishes off
  `Ω` has `tr(Yᴴ K) = ‖K‖_S1`. For `K = U diag(s) Vᴴ` with `s > 0` these `Y` are the matrices
  `U Vᴴ + W` with `Uᴴ W = 0`, `W V = 0` and `‖W‖_op ≤ 1`; when `V` is square, `W = 0`, and `K`
  is a minimum exactly when `U Vᴴ` vanishes off `Ω`.
- **Linear growth** (`exists_pos_le_nuclearNorm_add_iff`,
  `isMinOn_iff_of_exists_pos_le_nuclearNorm_add`,
  `not_exists_pos_le_nuclearNorm_add_of_full_column_rank`): the certificate's hypotheses hold
  exactly when some `c > 0` has `‖K‖_S1 + c ‖H‖_S1 ≤ ‖K + H‖_S1` for every `H` that vanishes
  on `Ω`, and then M recovers `K`. When `V` is square this fails as soon as `Ω` misses a cell.

These checks solve M by ADMM and compare. The small tables run every pattern at once, sorted
into the classes a theorem names; the prime tables run diagonals, the cross, random cells and
the training halves of `grok-simple.py` (`~/rust_projects/grokking_abmod/scripts`).

```sh
uv run --locked recovery equal 3 20000               # Theorem E, 3 × 3
uv run --locked recovery equal 4 20000               # Theorem E, 4 × 4: about two hours
uv run --locked recovery slow 4 20000 50000 100000 200000 400000
uv run --locked recovery margin 20000 --sizes 3 4 5 6 7 --count 2000   # the failure margin
uv run --locked recovery weighted 3 6000             # Theorem F, random weights
uv run --locked recovery tight 6000                  # Theorem F, weights with exact ties
uv run --locked recovery tight-slow 6000 30000 150000
uv run --locked recovery cross 100000                # Theorem F on the cross, 3 × 3 to 6 × 6
uv run --locked recovery zeros 30000                 # Theorem G, random moduli
uv run --locked recovery zeros 30000 --tight         # Theorem G, fixed moduli
uv run --locked recovery theorem-d 7 13 31           # Theorem D: ψ(a + b) and ψ(a³ + ab)
uv run --locked recovery diagonals 61 97             # Theorem D, items 3, 5 and 6
uv run --locked recovery survey 31 61 97             # ψ(a + b) from random and training cells
uv run --locked recovery long 31 20000 100000 300000
uv run --locked recovery cubic 31 61 97              # ψ(a³ + ab) from the training halves
uv run --locked recovery characters 31 61 97         # χ(ab) and χ(a + ab) from them
uv run --locked recovery periods 97 2 3 4 6 8 12 16 24 32 48   # (a + b)^m from them
uv run --locked recovery three-cells 20000           # rank above one: 2 × 2 from three cells
uv run --locked recovery rank 20000                  # rank 2 and 3, 4 × 4 to 8 × 8, random cells
uv run --locked recovery polar 20000                 # full column rank, random cells: item 5.4
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
| `margin` | one `N × N` of each size, `N` = 3 to 7 | the cells off every `k × l` block of the first rows and columns with `k + l > N`; 2000 random patterns without a permutation, each drawing a density uniform in [0.3, 0.9] and keeping each cell with it, seed 0 | ones | 20 000 | none: `‖Z‖_S1` against Lean's values |
| `tight` | three 3 × 3: A, B, C of `TIGHT_WEIGHTS` | the 510 nonempty ones of each | moduli with exact ties, random phases, seed 1 | 6000 | `‖X − K‖/‖K‖` off `Ω` |
| `tight-slow` | table A | its 144 rigid patterns with a plan | as in `tight` | up to 150 000 | `‖X − K‖/‖K‖` off `Ω` |
| `cross` | 400 of each size 3 × 3 to 6 × 6 | row 0 and column 0 | moduli uniform in [0.3, 2], random phases, then `\|a_0\|` and `\|b_0\|` set so that the shares `α₀`, `β₀` are uniform in (0.05, 0.95), seed 0 | 100 000 | `‖X − K‖/‖K‖` off `Ω` |
| `theorem-d` | `p × p`, p = 7, 13, 31 | diagonals `{0, 1}`, `{0, 3}`, `{0}`; `{0, 1}` minus `(0, 1)`; row 0 and column 0; `2p`, `4p` and `⌊p²/2⌋` random cells, seed 0 | `ψ(a + b)`, `ψ(a³ + ab)` | at most 20 000 | `‖X − K‖/‖K‖` off `Ω` |
| `diagonals` | `p × p`, p = 61, 97 | diagonals `{0, 1}`, `{0, 5}`, `{3, (p − 1)/2}` and `{0}` | `ψ(a + b)` | at most 200 000 | `‖X − K‖/‖K‖` off `Ω` |
| `survey` | `p × p`, p = 31, 61, 97 | diagonals `{0, 1}` with and without `(0, 1)`; row 0 and column 0; the training halves of seeds 7 and 11; each cell kept with probability 2, 4, 6, 8, 12, 20 or 30 %, three draws each, seeds `1000 p` to `1000 p + 2` | `ψ(a + b)` | at most 20 000 | `‖X − K‖/‖K‖` off `Ω` |
| `long` | `31 × 31` | the survey's rigid patterns with a permutation that are not elementary | `ψ(a + b)` | up to 300 000 | `‖X − K‖/‖K‖` off `Ω` |
| `cubic` | `p × p`, p = 31, 61, 97 | the training halves of seeds 7 and 11 | `ψ(a³ + ab)` | at most 20 000 | `‖X − K‖/‖K‖` off `Ω` |
| `characters` | `p × p`, p = 31, 61, 97 | the training halves of seeds 7 and 11 | `χ(ab)`, `χ(a + ab)`, `χ(g^k) = e^{2πik/(p − 1)}` for the least primitive root `g` | at most 20 000 | `‖X − K‖/‖K‖` off `Ω` |
| `periods` | `97 × 97` | the training halves of seeds 7 and 11 | `ρ((a + b)^m)`, `ρ` the Gaussian periods, `m` = 2, 3, 4, 6, 8, 12, 16, 24, 32, 48 | at most 20 000 | `‖X − K‖/‖K‖` off `Ω` |
| `three-cells` | 5000 of 2 × 2, 1000 of each kind, and the five tables of Lean's examples | the three cells other than `(0, 1)` | random; rank one, `u vᵀ`; rank two with `k₀₁ = x*`; moduli one; moduli one and rank one. Moduli uniform in [0.3, 2], random phases, seed 0 | 20 000 | `\|Z₀₁ − x*\|/‖K‖` |
| `rank` | 300 of each `N × N`, `N` = 4, 6, 8, of each rank `r` = 2, 3 and each kind | each cell kept with one density uniform in [0.3, 0.95], drawn again when every cell is kept | dense: `A Bᵀ` with `N × r` factors; blocks: `r` diagonal blocks of nearly equal sizes, each `a bᵀ`, and 0 off them. Factor entries with moduli uniform in [0.3, 2] and random phases, seed 0 | 20 000 | `‖X − K‖/‖K‖` off `Ω` |
| `polar` | 300 of each `m × n` = 4 × 4, 8 × 8, 6 × 3, 8 × 4, 8 × 2 and each kind of pattern | random: each cell kept with one density uniform in [0.3, 0.95], drawn again when every cell is kept; blocks: the same, with the cells of the blocks of `Q` added | `K = Q P`: `n` blocks of consecutive rows of nearly equal sizes (on a square table, the diagonal), column `j` of `Q` a unit vector of random entries on block `j` and 0 elsewhere, `P = Gᴴ G` with `G` an `n × n` matrix of random entries. Entries with moduli uniform in [0.3, 2] and random phases, seed 0 | 20 000 | `‖X − K‖/‖K‖` off `Ω` |

`TIGHT_WEIGHTS` (`application/weights.py`) give the shares `|a_i|²/‖a‖²` and `|b_j|²/‖b‖²` of
`(½, ¼, ¼)` for both (A), `(½, ¼, ¼)` and `(¼, ¼, ½)` (B), and `(⅗, ⅕, ⅕)` and `(⅕, ⅖, ⅖)` (C).
`TIGHT_MODULI` (`application/sweeps.py`) are `|a| = (1, 1, 0)` with `|b| = (1, 1, 0)` and with
`|b| = (1, 1, 1)`, `|a| = (2, 1, 0)` with `|b| = (1, 1, √3, 0)`, and `|a| = (1, √2, 0)` with
`|b| = (1, 0, √2)`. A tight Hall condition means that some proper set of rows `R` sees exactly
`|R|` columns; with room to spare, every one sees more.

ADMM: `X ← SVT_{1/ρ}(Z − U)`, `Z ← X + U` reset to `K` on `Ω`, `U ← U + X − Z`, with
`ρ = 1/√max(m, n)`. The checks report `Z`, which agrees with `K` on `Ω`: the gap is
`‖Z‖_S1 − ‖a‖ ‖b‖`, the error is that of `Z`, and recovered means an error below `10⁻⁶`. A
negative gap shows a completion cheaper than `K`, so M does not recover `K`. On the prime tables
one ADMM runs per pattern and stops when both residuals fall below `10⁻⁹`, or at the cap; a
training half is the first `⌊p²/2⌋` cells `(a, b)`, listed `a`-major and shuffled by
SplitMix64 seeded with `seed ^ 0x73706C6974730002`. A certificate is the least-Frobenius `Y`
that vanishes off `Ω` with unit row and column sums, measured by `‖Y − J/p‖_op`, or none when
no such `Y` exists; for a rigid `Ω` where it is not below 1, projected subgradient descent
over all such `Y` looks for a better one.

The two checks above rank one batch every table into one ADMM run. In `three-cells`, the rank
two kind has `k₁₀ = b`, `k₀₀ k₁₁ = c` with `|c| = |b|² + 0.1 + 2t`, `t` uniform in [0, 1], and
`k₀₁ = conj(b) c / |c|`, so that `x* = k₀₁` and `det K = c (1 − |b|²/|c|) ≠ 0`; `k₀₁ = x*`
is tested to within `10⁻¹² ‖K‖`, and recovered means `|Z₀₁ − k₀₁| < 10⁻⁶ ‖K‖`. In `rank`, each
pattern falls into one class, tested in this order: *not joined*, when the kept cells where
`K ≠ 0` do not join the row and the column of some nonzero entry (union–find); *not
injective*, when the least singular value, on `Ω`, of the orthonormal basis `u_a v_bᴴ` with
`a < r` or `b < r` of the matrices `U Aᴴ + B Vᴴ` (`U`, `V` from an SVD of `K`) is at most
`10⁻⁹`, or `Ω` has fewer cells than this basis; *certificate*, when some `W` with
`‖W‖_op < 1` was found; *none found* otherwise. Every `W` with `Uᴴ W = 0` and `W V = 0` is
`U⊥ G V⊥ᴴ`; the least-Frobenius `G` that makes `U Vᴴ + W` vanish off `Ω` comes from a
pseudoinverse, the system counting as solvable when its residual is at most `10⁻⁹`, and when
its `‖G‖_op` is not below 1 and the pattern is injective, 2000 steps of projected subgradient
descent on `‖G‖_op` look for a better one. The certificate is the least `‖W‖_op` found, and
the gap is `‖Z‖_S1 − ‖K‖_S1`.

`rank` and `polar` also read item 5 off the solver. The ADMM's `Y = −ρ U` vanishes off `Ω`, and
at a fixed point it is a subgradient of `‖·‖_S1` at `Z`. `Ŷ = Y / max(1, ‖Y‖_op)` is a
contraction that vanishes off `Ω`, so every `X` equal to `K` on `Ω` has
`‖X‖_S1 ≥ Re tr(Ŷᴴ X) = Re tr(Ŷᴴ K)`: the least nuclear norm lies between `Re tr(Ŷᴴ K)` and
`‖Z‖_S1`. A pattern is a *minimum* when `Re tr(Ŷᴴ K) ≥ (1 − 10⁻⁶) ‖K‖_S1`, *beaten* when
`‖Z‖_S1 < (1 − 10⁻⁶) ‖K‖_S1`, and *undecided* otherwise; it cannot be both. So a minimum here
is one to within `10⁻⁶ ‖K‖_S1`. On a beaten pattern, item 1.1 with `c = 1/‖W‖_op` and
`H = Z − K` puts every `W` with `Uᴴ W = 0`, `W V = 0` and `U Vᴴ + W` vanishing off `Ω` at
`‖W‖_op ≥ 1 − (‖Z‖_S1 − ‖K‖_S1)/‖Π (Z − K) Π'‖_S1`, with `Π = 1 − U Uᴴ` and `Π' = 1 − V Vᴴ`.
In `polar`, `Kᴴ K = P²`, so when `G` is invertible `K` has rank `n` and `U Vᴴ = Q` (by hand:
`Q` is the polar factor `K (Kᴴ K)^{−1/2}`); the check computes `U Vᴴ` from a singular value
decomposition of `K` and calls it vanishing off `Ω` when its entries there are at most
`10⁻⁹`. Before each singular value decomposition of the iteration, every real or imaginary part
below machine epsilon, `2.2·10⁻¹⁶`, times the largest part of its matrix is set to 0, which
moves each entry by less than `√2 · 2.2·10⁻¹⁶` times the largest. In cells that the minimum
fills with 0 the iterates shrink toward 0, and on some matrices with entries of `8.3·10⁻²⁹⁷`
or less beside entries of order 1, LAPACK returned NaN singular values without an error.

## What they found

Every class behaves as the theorems say. The numbers are those this package printed on
2026-10-29, to three digits; the `4 × 4` sweep is the first run's (below). The first runs, on
2026-10-28, were scripts in a session scratchpad (`small.py`, `weighted.py`, `zeros_check.py`,
`weighted_tight.py`, `weighted_slow.py`, `cross_weights.py`, `complete.py`, `diagonals.py`,
`patterns.py`, `matching.py`, `leaves.py`, `certopt.py`, `longrun.py`, `cubic_split.py`,
`chi_check.py`) with the same iteration and the same seeds. They printed the same counts and
the same values, with three exceptions: their step counts start from 0, one below these;
quantities at the level of rounding, such as gaps within `5·10⁻¹⁴` of 0, differ in the last
bits; and `complete.py` printed the weaker bound `√(1 − 1/(2p(p − 1)))` proved then.

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

`slow 4 20000 50000 100000 200000 400000`, the 27 068 rigid patterns with a tight Hall
condition: after 20 000 steps 22 604 are recovered, and the largest gap 6.62e-7 and the
largest error 8.46e-5 are those of the first run. The other 4464 run on:

| steps | gap | error |
| --- | --- | --- |
| 20 000 | 3.09e-10 to 6.62e-7 | 2.03e-5 to 8.46e-5 |
| 50 000 | 1.19e-10 to 1.73e-7 | 1.26e-5 to 3.47e-5 |
| 100 000 | 4.49e-11 to 6.20e-8 | 7.74e-6 to 1.75e-5 |
| 200 000 | 1.43e-11 to 2.21e-8 | 4.34e-6 to 8.83e-6 |
| 400 000 | 4.07e-12 to 7.84e-9 | 2.17e-6 to 4.43e-6 |

The largest error about halves each time the steps double, and the gap stays positive. Theorem E
proves that `J` is the only solution of M there, so the slowness is ADMM's.

The failure margin (`margin 20000 --sizes 3 4 5 6 7 --count 2000`). Off each `k × l` block with
`k + l > N`, `‖Z‖_S1` is Lean's least norm `√(k (N − l)) + √(l (N − k))` to within `5·10⁻¹⁵`, a
rounding error. A random pattern's least block value is the least of these values over the
blocks with `k + l > N` it misses; a completion has this norm
(`exists_nuclearNorm_eq_of_block`). The worst block is the `a × b` of `failureMargin`:

| `N` | worst block | its value − `N` | rigid | not rigid | largest gap, rigid | largest gap, not rigid | largest `‖Z‖_S1` − least block value |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3 | 2 × 2 | `√8 − 3` = −0.172 | 65 | 1935 | −0.172 | −0.172 | below 1e-14, rounding |
| 4 | 2 × 3 | `√2 + √6 − 4` = −0.136 | 117 | 1883 | −0.136 | −0.136 | below 1e-14, rounding |
| 5 | 3 × 3 | `√24 − 5` = −0.101 | 178 | 1822 | −0.101 | −0.101 | 2.08e-9 |
| 6 | 3 × 4 | `√6 + √12 − 6` = −0.0864 | 242 | 1758 | −0.0864 | −0.0864 | 7.63e-7 |
| 7 | 4 × 4 | `√48 − 7` = −0.0718 | 268 | 1732 | −0.0718 | −0.0784 | 4.65e-7 |

In each class the largest gap is, to six decimals, the largest least block value of its
patterns, and so at most the worst block's value. For `N = 7` the largest least block value of
the patterns that are not rigid is that of the `3 × 5` block.

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

Theorem F with exact ties (`tight 6000`). Recovered means an error below `10⁻⁶`; the rigid
patterns with a plan that are not recovered yet converge slowly (`tight-slow`, below).

| weights | class | patterns | recovered | gap | error |
| --- | --- | --- | --- | --- | --- |
| A | rigid, plan | 144 | 132 | 0 to 3.13e-6 | 1.44e-16 to 2.36e-4 |
| A | not rigid, plan | 24 | 0 | −4.44e-16 to 1.78e-15 | 0.866 to 1.00 |
| A | rigid, no plan | 60 | 0 | −0.536 to −0.136 | 0.366 to 0.667 |
| A | not rigid, no plan | 282 | 0 | −3.00 to −0.136 | 0.695 to 1.00 |
| B | rigid, plan | 144 | 132 | −4.44e-16 to 3.13e-6 | 4.53e-17 to 2.36e-4 |
| B | not rigid, plan | 24 | 0 | −8.88e-16 to 3.11e-15 | 0.866 to 1.00 |
| B | rigid, no plan | 60 | 0 | −0.536 to −0.136 | 0.366 to 0.667 |
| B | not rigid, no plan | 282 | 0 | −3.00 to −0.136 | 0.695 to 1.00 |
| C | rigid, plan | 110 | 90 | −1.78e-15 to 3.88e-6 | 1.11e-16 to 2.35e-4 |
| C | not rigid, plan | 8 | 0 | −2.66e-15 to 0 | 0.894 to 1.00 |
| C | rigid, no plan | 94 | 0 | −1.00 to −0.101 | 0.289 to 0.750 |
| C | not rigid, no plan | 298 | 0 | −4.00 to −0.101 | 0.633 to 1.00 |

`tight-slow 6000 30000 150000`: on the 144 rigid patterns with a plan of table A, the largest
error is 2.36e-4, 5.00e-5 and 1.02e-5, and the largest gap 3.13e-6, 3.00e-7 and 2.74e-8. The
same pattern, `{(0, 1), (0, 2), (1, 0), (1, 1), (2, 0), (2, 1), (2, 2)}`, is the worst at each
checkpoint, and 12 stay above `10⁻⁶`. Theorem F proves that `K` is the only solution of M
there, so the slowness is ADMM's.

Theorem F on the cross (`cross 100000`), all four sizes; `m = α₀ + β₀ − 1` is the margin of
item 4, which says that M recovers `a bᵀ` exactly when `m ≥ 0`:

| margin | tables | recovered | gap | error |
| --- | --- | --- | --- | --- |
| `m ≤ −0.05` | 723 | 0 | −3.88 to −2.57e-3 | 0.0994 to 0.938 |
| `−0.05 < m ≤ 0` | 72 | 0 | −4.39e-2 to −3.65e-6 | 2.46e-3 to 0.230 |
| `0 < m ≤ 0.05` | 73 | 73 | −7.11e-15 to 1.42e-14 | 1.39e-16 to 1.71e-15 |
| `m > 0.05` | 732 | 732 | −4.26e-14 to 2.84e-14 | 4.92e-17 to 1.51e-15 |

Each size splits the same way; the largest gap with `m ≤ 0` is −3.65e-6, −1.45e-4, −6.99e-5
and −2.53e-5 for `3 × 3` to `6 × 6`.

Theorem D (`theorem-d 7 13 31`), the error at `p = 7, 13, 31`; "cap" marks a run stopped at
20 000 steps:

| pattern | cells | `ψ(a + b)` | `ψ(a³ + ab)` |
| --- | --- | --- | --- |
| diagonals `{0, 1}` | `2p` | 2.37e-10, 1.33e-10, 1.10e-10 | 1.40, 1.37, 1.36 |
| diagonals `{0, 3}` | `2p` | 2.37e-10, 1.33e-10, 1.10e-10 | 1.33, 1.31, 1.35 |
| diagonal `{0}` | `p` | 1.00, 1.00, 1.00 | 1.00, 1.00, 1.00 |
| `{0, 1}` minus `(0, 1)` | `2p − 1` | 1.96e-9, 2.49e-9, 2.11e-4 (cap) | 1.38, 1.36, 1.36 (cap) |
| row 0 and column 0 | `2p − 1` | 0.833, 0.917, 0.967 | 1.04, 1.01, 1.00 |
| random | `2p` | 0.453, 0.576, 0.657 (cap) | 1.28 (cap), 1.17, 1.10 (cap) |
| random | `4p` | 4.56e-10, 6.71e-10, 0.193 | 1.29, 1.19, 1.15 |
| random | `⌊p²/2⌋` | 2.67e-5 (cap), 1.59e-10, 5.75e-11 | 1.22, 1.31, 1.30 |

For `ψ(a + b)`, the row 0 and column 0 give `‖Z‖_S1 = 2√(p − 1)` (4.8990, 6.9282, 10.9545),
and the `2p` random cells 6.4721, 11.0745 and 26.3278, all below `p = ‖K‖_S1`. The certificate
`(P₁ + P₂)/2` of the diagonals `{0, 1}` has `‖Y − J/p‖_op = cos(π/p)`: 0.900969, 0.970942 and
0.994869, below the proved `√(1 − 1/(4p²))`: 0.997446, 0.999260 and 0.999870.

`diagonals 61 97`: the three pairs of diagonals give the same numbers. `‖Y − J/p‖_op = cos(π/p)`
is 0.998674 and 0.999476 (proved bounds 0.999966 and 0.999987), and `ψ(a + b)` comes back with
error 8.83e-11 after 6813 steps and 6.56e-11 after 20 197. On one diagonal `Z` is 0 off `Ω`
and the error 1.00.

`survey 31 61 97`, 15 fixed patterns and 63 random draws:

- The six training halves are rigid and elementary, with certificates 0.3716 and 0.3813 at
  `p = 31`, 0.2580 and 0.2513 at 61, 0.2091 and 0.2087 at 97, and errors at most 6.59e-11.
- The 32 draws that are not rigid fail, with errors 0.132 to 0.999.
- The 21 rigid draws with a certificate below 1 are elementary and come back with errors at
  most 1.02e-10, within 310 steps.
- Nine rigid draws contain a permutation, and each has a row or a column with a single cell,
  so no certificate is below 1 (`not_isContraction_of_block`); the best found is 1.0000. At
  the cap they have `‖Z‖_S1 = p` to three decimals and errors 2.19e-5 to 5.41e-5.
- One rigid draw, `p = 61` at 8 %, draw 1, has a largest matching of 60 cells and fails:
  `‖Z‖_S1 = 60.912`, error 0.0560, best certificate 1.5566.
- The diagonals `{0, 1}` minus `(0, 1)` have certificate 1.0000, and at the cap errors 2.11e-4,
  6.03e-2 and 0.466: `forall_isMinOn_addKernel_of_diagonals_diff_of_ne` proves that M
  recovers `ψ(a + b)` there. The row 0 and column 0 have certificate `p − 1`.

`long 31 20000 100000 300000`, the survey's rigid patterns with a permutation that are not
elementary:

| pattern | 20 000 steps | 100 000 | 300 000 |
| --- | --- | --- | --- |
| `{0, 1}` minus `(0, 1)` | 2.11e-4 | 3.66e-9, stopped at 67 491 | |
| 12 %, draw 1 | 3.39e-5 | 8.18e-6 | 3.09e-6 |
| 20 %, draw 0 | 2.48e-5 | 5.11e-6 | 1.71e-6 |

Meanwhile `‖Z‖_S1 − p` stays positive and shrinks: 5.68e-5, then 9.65e-10; 6.77e-6, 6.74e-7,
1.47e-7; 2.88e-6, 2.71e-7, 5.27e-8.

`cubic 31 61 97`: on the six training halves `ψ(a³ + ab)` fails, with errors 1.2868 to 1.2989
and `‖Z‖_S1` from 0.5503 to 0.5565 times `p^{3/2} = ‖K‖_S1`.

`characters 31 61 97`: all 12 splits are rigid on the supports with a bijection between them,
and come back with errors 1.52e-11 to 7.53e-11, `‖Z‖_S1 = p − 1 = ‖K‖_S1` to three decimals and
every hidden cell decoded. On the zero row and column `Z` is 0 for `χ(ab)` and below
`5·10⁻¹⁵` for `χ(a + ab)`, rounding errors that change with the number of threads.

`periods 97 2 3 4 6 8 12 16 24 32 48`, 36 s: up to `d = gcd(m, 96) = 12` both training halves
give the table back in 98 to 275 steps, with errors 3.59e-12 to 1.50e-11 and every hidden cell
decoded. From `d = 16` on, both fail. `‖Z‖_S1 − ‖K‖_S1` is −0.449 and −0.755 for `d = 16` and
−110 to −1052 above; the errors are 3.94e-2 and 5.11e-2 for `d = 16` and 0.517 to 1.05 above.
The value of `ρ` nearest `Z` is the right one on 93.33% and 90.65% of the hidden cells for
`d = 16`, and on 49.42% to 54.58% above.

Rank above one, three cells (`three-cells 20000`). On every table the solver's `Z₀₁` is Lean's
`x*` to within `2.67·10⁻¹⁵ ‖K‖`, and the solver recovers `K` exactly when `k₀₁ = x*`:

| kind | tables | `k₀₁ = x*` | recovered | `\|det K\|/‖K‖²` |
| --- | --- | --- | --- | --- |
| random | 1000 | 0 | 0 | 9.85e-3 to 0.498 |
| rank one | 1000 | 521 | 521 | 0 to 9.95e-17 |
| rank two, `k₀₁ = x*` | 1000 | 1000 | 1000 | 1.61e-3 to 0.450 |
| moduli one | 1000 | 0 | 0 | 8.51e-4 to 0.500 |
| moduli one, rank one | 1000 | 1000 | 1000 | 0 to 1.00e-16 |

The tables of Lean's examples come out as Lean says: `[[2, 1], [1, 1]]` and `[[2, 1], [2, 1]]`
are recovered, `[[2, 1], [1, −1]]`, `[[1, 2], [1, 2]]` and `[[1, 1], [1, −1]]` are not.

Rank above one, random cells (`rank 20000`, ten minutes on the CPU), all 3600 patterns:

| class | patterns | recovered | gap | error | certificate |
| --- | --- | --- | --- | --- | --- |
| not joined | 1446 | 0 | −18.5 to −2.71e-5 | 0.0546 to 1.03 | no `W` |
| joined, not injective | 1037 | 117 | −15.4 to 8.88e-15 | 0 to 1.05 | no `W` for 749; 0 to 29.6 |
| injective, certificate | 468 | 468 | −1.42e-14 to 3.55e-14 | 0 to 7.17e-16 | 0 to 0.998 |
| injective, none found | 649 | 0 | −4.18 to −5.50e-6 | 6.16e-4 to 0.678 | 1.00 to 152 |

Each of the twelve runs shows the same. No pattern whose cells do not join is recovered, as
item 2 says, and every injective one with a certificate is, as item 1.2 says. On the 649
injective patterns where the search found no `W` below 1, the gap is negative: `K` is not even
a minimum. The 117 recovered patterns that are not injective are all block tables: 17, 59, 12,
18, 3 and 8 of the 38, 83, 34, 42, 32 and 59 block tables of this class at `4 × 4` of rank 2
and 3, `6 × 6` of rank 2 and 3, and `8 × 8` of rank 2 and 3. For the 749 dense tables of the
class the system for `W` has no solution. As item 4 proves for three cells, recovery does not
need the injectivity.

Item 5 on the same run. On every pattern `Y` vanishes off `Ω` exactly, `‖Y‖_op ≤ 1 + 1.23·10⁻⁷`,
and `‖Z‖_S1 − Re tr(Ŷᴴ K)` lies between `−3.91·10⁻¹⁴` and `3.70·10⁻⁵`. No pattern is undecided:

| standing | patterns | recovered | classes | search for `W` | margin |
| --- | --- | --- | --- | --- | --- |
| minimum | 590 | 585 | joined, not injective 119; injective, certificate 468; injective, none found 3 | `‖W‖_op ≤ 1` for 585, above 1 for 5 | `(‖K‖_S1 − Re tr(Ŷᴴ K))/‖K‖_S1`: −1.24e-15 to 3.82e-7 |
| beaten | 3010 | 0 | not joined 1446; joined, not injective 918; injective, none found 646 | no `W` for 2195, above 1 for 815 | gap over `‖K‖_S1`: −1.00 to −1.16e-6 |

On the minima, `‖Ŷ V − U‖_F` and `‖Ŷᴴ U − V‖_F` are at most `1.76·10⁻³` and `‖Ŷ − U Vᴴ‖_op` at
most `1 + 1.4·10⁻⁶`: to this accuracy `Ŷ` is item 5.2's `U Vᴴ + W`. On the 815 beaten patterns
with a `W`, item 1.1 puts every `W` at or above a bound between 1.00 and 22.1, and the `W` found
lie `2.15·10⁻³` to 148 above it. So item 5.3 holds on every pattern: a `W` with `‖W‖_op ≤ 1`
turns up only on minima. The 5 minima not recovered are the 3 of class *injective, none found*
and 2 that are not injective.

Full column rank (`polar 20000`), all 3000 patterns. Item 5.4 decides every one: where `U Vᴴ`
vanishes off `Ω`, `Ŷ` shows `K` a minimum, and where it does not, the solver beats `K`:

| shape | random cells: `U Vᴴ` vanishes off `Ω`, minima | recovered | does not vanish, beaten | with the blocks: minima | recovered |
| --- | --- | --- | --- | --- | --- |
| 4 × 4 | 59 | 37 | 241 | 300 | 122 |
| 8 × 8 | 36 | 23 | 264 | 300 | 49 |
| 6 × 3 | 34 | 34 | 266 | 300 | 250 |
| 8 × 4 | 38 | 38 | 262 | 300 | 222 |
| 8 × 2 | 28 | 28 | 272 | 300 | 297 |

Where `U Vᴴ` vanishes off `Ω`, its entries there are at most `9.04·10⁻¹³` and
`‖K‖_S1 − Re tr(Ŷᴴ K)` at most `4.85·10⁻¹¹ ‖K‖_S1`; where it does not, its largest entry there
is 0.134 to 1, and `Z` is cheaper than `K` by `8.87·10⁻⁵` to `0.872` of `‖K‖_S1`. On the square
tables `Q` is diagonal, so `U Vᴴ` vanishes off `Ω` exactly when `Ω` holds the diagonal. With `V`
square every matrix is a `U Aᴴ + B Vᴴ`, so no pattern is injective, and by
`not_exists_pos_le_nuclearNorm_add_of_full_column_rank` all 1100 recoveries come without linear
growth, where the certificate never applies. Of the 595 minima not recovered, 33 have cells
that do not join (item 2).
