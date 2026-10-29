# Training

Does the course's network learn `f(a, b) mod 97` from half of its table, and does the peak `κ`
of the table say beforehand which tasks it learns? Does it learn every function `g(a + b)`, as
it learns `π(a + b)` for a permutation `π`, and if not, does the spectrum of `g` decide which?

The network is the Rotate90 model of grok-simple.py (`~/rust_projects/grokking_abmod/scripts`),
ported unchanged (`infrastructure/model.py`): one table `E` embeds `a` and `b` and reads out
the answer, `J` turns each channel pair of `E[b]` by 90°,
`x = n(E[a] + J E[b])`, one block `x ← x + n(SwiGLU(n(x)))`, `logits = n(x) Eᵀ`, with `n` an
RMSNorm without parameters. Its protocol and defaults are grok-simple's (`RunSpec` in
`application/ports.py`): `p = 97`, half of the `p²` cells for training, width 128, weight decay
1, 10 000 steps, seeds 7 and 11.

`κ` is the largest `σ₁(C(conj ρ(F)))² / p²` over phase readouts `ρ`, `|ρ(c)| = 1`, where `F` is
the table, `ρ(F)` the matrix of `ρ(f(a, b))` and `C` removes the row and column means
(`infrastructure/kappa.py`). It lies in [0, 1], and is 1 for `a + b`. Alternating maximization
from 456 starts at `p = 97` (every nontrivial additive and multiplicative character, the parity
readout, 8 ramps, 256 random phases) gives a lower bound; `hits` counts the starts within
`10⁻³` of the best.

```sh
uv run --locked training train                                   # AdamW, learning rate 1e-3
uv run --locked training train --optimizer schedule-free-adamw --lr 1e-3   # also 0.01, 0.03
uv run --locked training report --optimizer schedule-free-adamw --lr 1e-3  # one column below
uv run --locked training train --tasks sum-pow16 sum-pow48 --optimizer schedule-free-adamw \
  --lr 0.01 --depth 2                       # also --depth 4, 8; --width 512; --steps 100000
uv run --locked training train --optimizer schedule-free-adamw --lr 0.01 --tasks sum-interval \
  sum-interval-2 sum-interval-4 sum-interval-8 sum-interval-12 sum-random-half sum-squares
uv run --locked training kappa runs/kappa.json 47 97 199         # κ of every task
uv run --locked python -m unittest discover -s tests
```

Training runs on the GPU unless `--device cpu` is given, about 35 s a run on an RTX 3050;
`runs/` keeps every finished run, and a rerun resumes. A run is stored in
`runs/<optimizer>-lr<rate>/<task>-<seed>/`, with `-w<width>`, `-d<depth>` and `-s<steps>` after
the rate when they are not 128, 1 and 10 000.

## How the runs differ

| run | optimizer | learning rate | tasks | seeds | steps |
| --- | --- | --- | --- | --- | --- |
| `adamw-lr0.001` | AdamW with a linear warmup of 10 steps, as grok-simple.py | 1e-3 | the 15 below | 7, 11 | 10 000 |
| `schedule-free-adamw-lr0.001` | Schedule-Free AdamW | 1e-3 | the 15 below | 7, 11 | 10 000 |
| `schedule-free-adamw-lr0.01` | Schedule-Free AdamW | 0.01 | the 15 below and the seven sets `[a + b ∈ A]` | 7, 11 | 10 000 |
| `schedule-free-adamw-lr0.03` | Schedule-Free AdamW | 0.03 | the 15 below | 7, 11 | 10 000 |
| `schedule-free-adamw-lr0.01-s100000` | Schedule-Free AdamW | 0.01 | `sum-pow16`, `sum-pow48` | 7, 11 | 100 000 |
| `schedule-free-adamw-lr0.01-w512` | Schedule-Free AdamW, width 512 (1365 hidden units) | 0.01 | `sum-pow16`, `sum-pow48` | 7, 11 | 10 000 |
| `schedule-free-adamw-lr0.0025-w512` | Schedule-Free AdamW, width 512 (1365 hidden units) | 0.0025 | `sum-pow16`, `sum-pow48` | 7, 11 | 10 000 |
| `schedule-free-adamw-lr0.01-d2`, `-d4`, `-d8` | Schedule-Free AdamW, 2, 4 and 8 blocks | 0.01 | `sum-pow16`, `sum-pow48` | 7, 11 | 10 000 |

## What they found

The step at which validation accuracy first reached 99%, checked every 500 steps, for seeds 7
and 11; `—` means never in 10 000 steps:

| task | `f(a, b)` | `κ`, p = 97 | AdamW 1e-3 | Schedule-Free 1e-3 | 0.01 | 0.03 |
| --- | --- | --- | --- | --- | --- | --- |
| mul | `a·b` | 0.9795 | 1000, 1000 | 3000, 2500 | 500, 500 | 500, 500 |
| square-times | `a²b` | 0.9795 | 1000, 1000 | 4000, 3500 | 500, 500 | 1000, 1000 |
| affine-product | `a + ab` | 0.9795 | 1500, 1000 | 5000, 5000 | 500, 500 | 500, 500 |
| sum-square | `(a + b)²` | 0.4053 | 1000, 1000 | 4000, 3500 | 500, 500 | 500, 500 |
| perm-add | `π(a + b)` | 1.0000 | 1500, 1500 | 5500, 5500 | 500, 500 | 500, 500 |
| cube-plus | `a³ + b` | 0.9927 | 1500, 1500 | 4000, 4500 | 500, 500 | 500, 500 |
| sum-cube | `(a + b)³` | 0.2756 | 3000, 3000 | 9500, — | 1000, 1000 | 2000, 1500 |
| square-product | `a² + ab` | 0.0778 | —, — | —, — | —, — | —, — |
| quadratic-linear | `a² + ab + b² + a` | 0.0979 | —, — | —, — | —, — | —, — |
| cubic-mixed | `a³ + ab² + b` | 0.0672 | —, — | —, — | —, — | —, — |
| cubic-product | `a³ + ab` | 0.1059 | —, — | —, — | —, — | —, — |
| quadratic | `a² + ab + b²` | 0.0979 | —, — | —, — | —, — | —, — |
| parity-cubic | `2⌊(a³ + ab)/2⌋ + parity(a + b)` | 0.9823 | —, — | —, — | —, — | —, — |
| sum-pow16 | `(a + b)¹⁶` | 0.0427 | —, — | —, — | —, — | —, — |
| sum-pow48 | `(a + b)⁴⁸` | 0.0125 | —, — | —, — | —, — | —, — |

- All four runs split the tasks alike (numerical). The seven tasks with `κ ≥ 0.2756` reach 99%,
  except `sum-cube` with seed 11 under Schedule-Free AdamW at 1e-3, which is at 97.70% and
  still rising when training stops at 10 000 steps. The five with `κ` from 0.0672 to 0.1059 never
  do: they end at 0.68% to 2.17% validation accuracy, near chance (1/97 ≈ 1.03%), and their
  parity accuracy is 45.75% to 51.48%. Nor do the two powers of `a + b`, with `κ = 0.0427` and
  0.0125, which the next section treats.
- Under Schedule-Free AdamW, no run that reached 99% falls below it at a later check. Under
  AdamW, three do: `sum-square` with seed 7 (down to 97.94% at step 5500) and seed 11 (98.32%
  at step 8000), and `sum-cube` with seed 7 (95.52% at step 4500), which ends on such a dip, at
  97.68%. Under Schedule-Free AdamW the same `sum-cube` run ends at 99.53%, 99.94% and 99.55%
  at 1e-3, 0.01 and 0.03. In these runs, the dips occur only under AdamW.
- The ten predictions made from `κ` before these tasks ran (`PREDICTED_LEARN` and
  `PREDICTED_FAIL` in `application/runs.py`) all held, except `sum-cube` with seed 11 under
  Schedule-Free AdamW at 1e-3.
- A large `κ` is not enough (a heuristic criterion whose converse fails): `parity-cubic` has
  `κ = 0.9823` and ends at 2.01% to 6.78% validation accuracy with 78.68% to 91.82% parity
  accuracy. The network learns the parity bit, not the rest.
- At the same learning rate 1e-3, Schedule-Free AdamW reaches 99% 2.5 to 5 times later than
  AdamW. At 0.01 and 0.03 it reaches 99% at the first or second check (500 or 1000 steps), and
  `sum-cube` at 1000 to 2000.
- `κ` depends on `p`: `sum-cube` has `κ = 1.0000` at `p = 47`, where `3 ∤ 46` makes `x ↦ x³` a
  bijection, and 0.2756 at `p = 97`, 0.2755 at `p = 199`. `runs/kappa.json` holds `κ` at
  `p` = 47, 97 and 199 for the 23 tasks of `domain/tasks.py` other than the two powers and the
  seven sets `[a + b ∈ A]`, and for `abs-diff` and `parity-cubic` with the answer's lowest bit
  dropped; at 47 and 97 for the two powers; at 97 for the seven sets.

## Two powers of `a + b`

At `p = 97`, `(a + b)⁴⁸` is the Legendre symbol of `a + b` (Euler's criterion), with the values 0,
1 and 96, and `(a + b)¹⁶` takes 7 values: 0 and the six sixth roots of unity. Two predictions,
recorded before these tasks ran (`DISAGREE` in `application/runs.py`), disagree on them:

- `κ` is 0.0427 and 0.0125, below that of every task that failed, so `κ` predicts failure. For a
  table `g(a + b)`, `κ = max over k ≠ 0 of (Σ_v |Σ_{g(c) = v} ω^{kc}|)² / p²` with
  `ω = e^{2πi/p}` (hand: the matrix `[φ(a + b)]` has the singular values `|φ̂(k)|`). This gives
  0.042724 and `(1 + √97)²/97² = 0.012509`; the solver finds the same, with 441 of its 456 starts
  within `10⁻³` of the best. At `p = 47` both are 0.4054, the value of `sum-square`: there
  `x⁴⁸ = x²`, and `x¹⁶` is `x²` followed by a bijection of the squares.
- `a + b` has rank one under `ψ`, so the hypothesis that `g(h)` is learned for every `g` when `h`
  has rank one under an injective readout predicts success.

Validation accuracy at the end of each run, for seeds 7 and 11. On the held-out half, a random
guess with the answers' frequencies there scores on average 16.36% for `(a + b)¹⁶` and 49.03% to
49.06% for `(a + b)⁴⁸`:

| network | optimizer, learning rate | steps | `(a + b)¹⁶` | `(a + b)⁴⁸` |
| --- | --- | --- | --- | --- |
| width 128, 1 block | AdamW, 1e-3 | 10 000 | 60.87%, 84.57% | 44.21%, 44.36% |
| width 128, 1 block | Schedule-Free, 1e-3 | 10 000 | 24.10%, 26.27% | 45.74%, 44.78% |
| width 128, 1 block | Schedule-Free, 0.01 | 10 000 | 79.89%, 73.20% | 44.12%, 44.31% |
| width 128, 1 block | Schedule-Free, 0.03 | 10 000 | 62.42%, 61.64% | 43.63%, 43.27% |
| width 128, 1 block | Schedule-Free, 0.01 | 100 000 | 85.25%, 79.74% | 44.78%, 43.89% |
| width 512, 1 block | Schedule-Free, 0.01 | 10 000 | 25.38%, 27.80% | 43.12%, 42.23% |
| width 512, 1 block | Schedule-Free, 0.0025 | 10 000 | 30.84%, 31.67% | 44.12%, 44.17% |
| width 128, 2 blocks | Schedule-Free, 0.01 | 10 000 | 58.87%, 62.04% | 43.00%, 43.93% |
| width 128, 4 blocks | Schedule-Free, 0.01 | 10 000 | 28.69%, 30.86% | 42.47%, 42.40% |
| width 128, 8 blocks | Schedule-Free, 0.01 | 10 000 | 14.86%, 14.60% | 42.23%, 43.32% |

- No run reaches 99% on either task, and every run ends with 97.39% to 100% training accuracy
  (numerical). The hypothesis on `g(h)` fails on both tasks; the prediction of `κ` holds at the
  99% level.
- `(a + b)⁴⁸` is not learned at all. From step 500 on, no check exceeds 47.40%, below the
  frequency guess. At Schedule-Free 0.01 and 10 000 steps, 98% of the errors swap 1 and 96. The
  predictions are not a function of `a + b`: in every run, 56.92% to 59.53% of the held-out
  predictions equal the most common prediction of their sum, and that prediction is right, and
  unique, on only 11 to 30 of the 97 sums.
- `(a + b)¹⁶` is learned in part. In the 10 runs that end at 58.87% or more, the most common
  prediction on the held-out cells of each sum `c` is the answer `c¹⁶`, for all 97 sums: a vote
  along each sum would answer every held-out cell. In the other 10, which end at 14.60% to
  31.67%, that vote is right on 10 to 88 sums. A small `κ` thus does not mean accuracy near
  chance. Among these five tasks `g(a + b)`, the order of `κ` is the order of success: `perm-add`,
  `sum-square` and `sum-cube` (`κ` = 1.0000, 0.4053 and 0.2756) reach 99% in all runs but one,
  `sum-pow16` (0.0427) is learned in part, `sum-pow48` (0.0125) not at all. Across families it
  is not: `square-product`, with `κ = 0.0778`, ends near chance. Nor is it among all tasks
  `g(a + b)`: in the next section, the indicator of `I₂` has `κ = 0.3374`, above that of
  `sum-cube`, and ends at 91.33% and 91.43%.
- Training ten times longer reaches a plateau, not 99%. The 100 000-step runs repeat the
  10 000-step runs exactly up to step 10 000. `(a + b)¹⁶` then rises from 79.89% and 73.20% and,
  from step 30 000 to 100 000, stays between 84.21% and 87.35% (seed 7) and between 78.43% and
  81.17% (seed 11); `(a + b)⁴⁸` stays between 43.78% and 45.27%.
- A larger network does not help within 10 000 steps. `(a + b)⁴⁸` stays at 42.23% to 44.17%.
  At the learning rate 0.01, `(a + b)¹⁶` ends lower than with one block at width 128 (73.20% and
  79.89%): 58.87% to 62.04% with 2 blocks, 28.69% to 30.86% with 4, 14.60% to 14.86% with 8,
  below the frequency guess, and 25.38% to 27.80% at width 512. Width 512 at
  0.0025 = 0.01 · 128/512 ends at 30.84% to 31.67%, between width 128 at 1e-3 and at 0.01.
  Each of these runs is at its best on `(a + b)¹⁶` at step 9000 or later, so where it would end
  is not measured.
- A heuristic reading: the Fourier coefficients of the Legendre symbol all have modulus `√97` for
  `k ≠ 0` (Gauss sums), so every wave of `a + b` carries the same share and no few of them
  predict it. The accuracies below the frequency guess fit a leave-one-out effect: each row has
  48 squares and 48 non-squares among its sums, so hiding a cell whose sum is a square leaves
  more non-squares among the training cells of its row and of its column.

## One size of set, different spectra

The seven tasks `[a + b ∈ A]` (`SPECTRUM` in `application/runs.py`, with the predictions recorded
before they ran) have sets `A` of `(p − 1)/2 = 48` residues. All seven tables thus have the answer
1 on 48 of the 97 sums and 0 on the other 49, and differ only in which sums give 1. `I` is the
interval `{0, …, 47}`, `I_j` the interval with `j` of its points exchanged for `j` points outside
it (`I₄` keeps the swaps of `I₂`, and so on), `R` a fixed random set and `Q` the nonzero squares,
the set where `(a + b)⁴⁸ = 1`. For an indicator the formula of the previous section gives
`κ = 4 max_{k ≠ 0} |Σ_{c ∈ A} ω^{kc}|² / p²`, and the solver finds the same seven values, with
363 to 384 of its 456 starts within `10⁻³` of the best. This `κ` is `2|A|(p − |A|)/p² = 0.49995`
times the share of the variance of the indicator of `A` that its strongest real wave
`cos(2πkc/p + θ)` carries (hand, by Parseval's identity): 81.07% for `I`, 7.73% for `R`, 2.50%
for `Q`. One wave classifies `I` exactly: `cos(2π(c − 23.5)/97) > 0` if and only if
`c ∈ {0, …, 47}` (hand).

Schedule-Free AdamW at 0.01, width 128, 10 000 steps, seeds 7 and 11. On the held-out half, a
random guess with the answers' frequencies there scores on average 50.00% to 50.03%, the most
common answer there 50.27% to 51.31%. Every prediction is 0 or 1. The vote counts the sums `c`
whose held-out cells have the right answer as their unique most common prediction:

| task | `A` | `κ`, p = 97 | validation accuracy | vote right, of 97 sums |
| --- | --- | --- | --- | --- |
| sum-interval | `I` | 0.4053 | 96.98%, 97.47% | 94, 94 |
| sum-interval-2 | `I₂` | 0.3374 | 91.33%, 91.43% | 93, 92 |
| sum-interval-4 | `I₄` | 0.2667 | 84.25%, 84.55% | 87, 87 |
| sum-interval-8 | `I₈` | 0.1997 | 70.46%, 68.59% | 74, 71 |
| sum-interval-12 | `I₁₂` | 0.1187 | 68.37%, 68.27% | 77, 77 |
| sum-random-half | `R` | 0.0386 | 53.33%, 53.56% | 59, 53 |
| sum-squares | `Q` | 0.0125 | 44.21%, 46.16% | 25, 29 |

- The first prediction held (numerical): for each seed, the accuracy falls strictly with `κ`,
  though the answers have the same frequencies in all seven tasks. From `I₈` to `I₁₂` it falls
  by only 2.09 and 0.32 points, while the two seeds of `I₈` differ by 1.87, and the vote is right
  on more sums with `I₁₂` (77, 77) than with `I₈` (74, 71). No run reaches 99%, and every run
  ends with 99.72% to 100% training accuracy. A heuristic reading: weight decay favors fits by
  few waves, and the less of `A` its strongest wave carries, the more waves a fit of `A` needs.
- The second held for few swaps. With `I₂` and `I₄`, in both seeds, the vote gives the
  interval's answer, not the task's, on every swapped sum (4 of 4 and 8 of 8), and the task's
  answer on 93 and 92 of the 93 other sums and on 87 of the 89. With `I₈` it follows the
  interval on 13 and 15 of the 16 swapped sums and is right on 71 and 70 of the 81 others; with
  `I₁₂` it follows the interval on only 13 and 11 of the 24, and is right on 66 and 65 of the 73.
  The wrong unswapped sums lie near the boundaries of `I`, in 38 to 49 and 88 to 96, except 12
  with `I₁₂`. The accuracy stays below the predicted `(97 − 2j)/97` (95.88%, 91.75%, 83.51% and
  75.26%): with `I₂`, 94.38% to 94.75% of the held-out cells of the unswapped sums are right and
  13.54% to 15.38% of those of the swapped sums; with `I₄`, 89.52% to 90.20% and 20.05% to
  23.47%.
- The third held in part: the interval is learned except at its boundaries, and not to 99%. In
  both seeds the vote is right on 94 of the 97 sums. Its 3 wrong sums, `{47, 48, 96}` and
  `{0, 48, 96}`, lie at the two boundaries of `I`, between 47 and 48 and between 96 and 0. On
  these four sums 33% to 65% of the held-out cells are right, against 79% to 96% on their
  neighbors 1, 46, 49 and 95. They are the four sums where the wave above is closest to 0:
  `|cos| ≤ 0.049` there, at least 0.080 elsewhere (hand). `sum-square` has exactly the `κ` of
  `I`, `(Σ_c |cos(2πc/97)|)² / 97²` (hand), yet reaches 99% by step 500 at this learning rate:
  equal `κ` does not give equal success.
- `R` and `Q` are not learned. `R` ends at 53.33% and 53.56%, 3.30 and 3.56 points above the
  frequency guess, with the vote right on 59 and 53 sums; `Q` at 44.21% and 46.16%, below it, as
  `(a + b)⁴⁸` above, which is 1 on the same set.
