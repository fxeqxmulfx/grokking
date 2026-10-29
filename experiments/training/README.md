# Training

Does the course's network learn `f(a, b) mod 97` from half of its table, and does the peak `κ`
of the table say beforehand which tasks it learns?

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
uv run --locked training kappa runs/kappa.json 47 97 199         # κ of 25 tasks
uv run --locked python -m unittest discover -s tests
```

Training runs on the GPU unless `--device cpu` is given, about 35 s a run on an RTX 3050;
`runs/` keeps every finished run, and a rerun resumes.

## How the runs differ

| run | optimizer | learning rate | tasks | seeds | steps |
| --- | --- | --- | --- | --- | --- |
| `adamw-lr0.001` | AdamW with a linear warmup of 10 steps, as grok-simple.py | 1e-3 | the 13 below | 7, 11 | 10 000 |
| `schedule-free-adamw-lr0.001` | Schedule-Free AdamW | 1e-3 | the 13 below | 7, 11 | 10 000 |
| `schedule-free-adamw-lr0.01` | Schedule-Free AdamW | 0.01 | the 13 below | 7, 11 | 10 000 |
| `schedule-free-adamw-lr0.03` | Schedule-Free AdamW | 0.03 | the 13 below | 7, 11 | 10 000 |

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

- All four runs split the tasks alike (numerical). The seven tasks with `κ ≥ 0.2756` reach 99%,
  except `sum-cube` with seed 11 under Schedule-Free AdamW at 1e-3, which is at 97.70% and
  still rising when training stops at 10 000 steps. The five with `κ ≤ 0.1059` never do: they
  end at 0.68% to 2.17% validation accuracy, near chance (1/97 ≈ 1.03%), and their parity
  accuracy is 45.75% to 51.48%.
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
  bijection, and 0.2756 at `p = 97`, 0.2755 at `p = 199`. `runs/kappa.json` holds all 25
  tasks at `p` = 47, 97 and 199.
