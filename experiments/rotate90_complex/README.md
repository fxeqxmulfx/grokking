# Rotate90 with complex products, in Kernite

User request, 2026-11-07: replace the simple Rotate90 model's SwiGLU with a
complex product and retest `(a+b)^3 mod 97`, using Rust/Kernite. Keep AdamW and
save checkpoints every 500 epochs. This is a numerical experiment, not a Lean
claim about recovery or convergence.

The common network is exactly the attention-free course architecture:

```
x = n(E[a] + J E[b])
x = x + n(FF(n(x)))
logits = n(x) E^T
```

Here `n` is parameter-free RMSNorm with float32 epsilon and
`J(re,im)=(-im,re)` acts on adjacent coordinate pairs. There are no biases or
attention layers. Both inputs and the readout share the same 97-by-128 table.
Inputs are raw residues: no intermediate sum, Fourier features or cube roots
are supplied. All 97 output logits compete in cross-entropy.

## Frozen comparison

| Arm | Projections | Hidden operation before output projection |
| --- | --- | --- |
| `real-swiglu` | General real matrices, 341 hidden coordinates | `SiLU(g) * u` |
| `complex-diagonal` | Complex-linear matrices, 341 complex hidden coordinates | `s(g) * (g_re*u_re, g_im*u_im)` |
| `complex-product-radial` | Identical to diagonal | `s(g) * g*u/sqrt(2)` |
| `complex-product-plain` | Identical to diagonal | `g*u/sqrt(2)` |

`s(g) = sigmoid(sqrt(|g|^2 + float32_epsilon))`. A complex product is
`(g_re*u_re - g_im*u_im, g_re*u_im + g_im*u_re)`. The radial variant is the
same proposal as the earlier complex-transformer experiment; the plain arm
tests multiplication without its gate. The sqrt(2) factor calibrates the
product's component variance. Branch RMS largely removes uniform scaling but
its nonzero epsilon means this is not an exact scale invariance.

Every arm has **143360 independent real parameters**: 12416 in the shared
embedding, and 130944 in the block. The real arm has 341 real hidden units;
the complex arms have 341 complex units, and all three projections are
complex-linear. Matrices are stored in their real expansion, with tied
`A, -B, B, A` blocks. AdamW sums/subtracts their gradients before updating
each independent component once. The coordinate-wise optimizer has separate
real/imaginary second moments; it is ordinary AdamW, not the phase-coupled
alternative from the earlier experiment.

The diagonal/radial-product contrast holds projections, initialization,
hidden width, gate and batches fixed. The plain/radial-product contrast
changes only the gate. The real/complex contrast also changes projection
constraints and hidden representation; it is not an activation-only ablation.
Independent parameter count is matched, GPU work is not.

The protocol is frozen before observing the runs:

- Seeds **7 and 11**, matching `experiments/training`; 4704 training equations
  and 4705 held out. A regression checks the exact held-out ordering against
  hashes extracted from the archived cubic runs (`historical_splits.json`).
- Width **128 real coordinates**, one residual block. All arms share the
  embedding initialization; all complex arms share every initial parameter.
- AdamW: **learning rate .001, decay 1, betas (.9,.98), epsilon 1e-8**; linear
  warmup over the first 10 updates, including a nonzero first update.
- Batch **512**, shuffled without replacement, tail **96**; 10 updates per
  epoch. **10000 updates = 1000 epochs**, even after reaching 99%.
- Evaluate both entire splits every **100 updates**, recording the first
  observed 99% crossing, best and final accuracy. Later dips remain visible.
  The older experiment evaluated every 500 updates, so first crossings have
  different temporal resolution.
- Checkpoint only at **0, 500 and 1000 epochs**, or a clean stop. Each immutable
  checkpoint contains parameters, both moments, update count and the entire
  observed history; hashes bind it to source, compiled PTX and inputs.
- Rotate arm execution order across seeds. Retain every declared outcome,
  including errors or a 600-second per-run stop. `STOP` in a run directory
  requests a clean checkpoint. Existing output directories are never overwritten.

The SplitMix64 split, sampler and real-model initialization are ported from
the course at `a3eb468`. FP32 CUDA kernels and the separated FP64 RMS derivative
are ported from `python_projects/gpt` at `786696b`. The latter avoids radial
cancellation but differs numerically from the Torch implementation; these are
fresh native controls, not bitwise replays of old training trajectories.
The new kernels implement Rotate90 and its tied-embedding adjoint. All model,
optimizer, evaluation and checkpoint work is Rust; there is no Python runtime.

Kernite is currently `/home/misha/rust_projects/kgen`, commit
`a1b6bc2c956e1a5f35960e26b209e1b6c213096c`. No backend patch is needed. The manifest
uses that local checkout. FP32 SGEMM comes from its matmul example; the retained
MIT attribution is in `KERNITE_LICENSE`. Code follows domain → application →
infrastructure → interfaces, with third-party imports only in the last two.

## Reproduction and validation

Run from this directory, on the NVIDIA GPU:

```sh
cargo test --offline --release
cargo test --offline --release -- --ignored --test-threads=1
cargo fmt --check
cargo clippy --offline --release --all-targets -- -D warnings
cargo build --offline --release
target/release/rotate90-complex-kernite protocol
target/release/rotate90-complex-kernite run runs/cubic-adamw
target/release/rotate90-complex-kernite audit runs/cubic-adamw
```

The tests check historical splits, complete sampled epochs, parameter ownership,
direct complex matrix multiplication, checkpoint cadence, full/tail-batch
forward values against an independent scalar FP64 model, whole-model parameter
directional derivatives, the product's derivatives including zero radius,
AdamW contraction/bias correction/warmup, tied readout argmax and loss, and exact
state continuation across the epoch tail and warmup boundary in every arm.
The audit replays all 24 saved states, validates history prefixes and summaries,
and checks the declared checkpoint cadence and all input hashes.

## Results

All eight runs completed 10000 updates. No run failed or reached its time cap.
All 24 saved states reproduce their exact training/validation correctness
counts and losses. The complete histories and states remain in
`runs/cubic-adamw/`, with the exact executable and source archive. The tracked
[summary](results.json), [audit](audit.json) and [validation record](validation.json)
include every declared outcome. Implementation/protocol commit: `b70811e`.

| Arm | Seed 7 first 99%, epoch | Seed 11 first 99%, epoch | Seed 7 final accuracy | Seed 11 final accuracy |
| --- | ---: | ---: | ---: | ---: |
| Real SwiGLU | 260 | 300 | 99.43% | 99.17% |
| Complex diagonal | 170 | 180 | 99.83% | 99.74% |
| Complex radial product | 90 | 110 | 99.68% | 98.79% |
| Complex plain product | **80** | **100** | **99.66%** | **99.68%** |

The plain product reaches the first observed 99% crossing in 3.25 and 3 times
fewer updates than SwiGLU, and earlier than the diagonal control in both
seeds. The radial product also beats its paired diagonal control, by factors
1.89 and 1.64. Removing the radial gate advances the first crossing by one
report interval (10 epochs) in each seed; this modest difference does not
establish a general advantage of removing gates.

All eight runs later dip below 99%. Their lowest observed accuracy after the
first crossing is 89.84%/91.56% for SwiGLU, 89.56%/91.88% for the diagonal
control, 97.81%/97.11% for the radial product and 98.45%/97.32% for the plain
product. The radial product's second seed ends on a dip. First crossing is
therefore not stable recovery, and the diagonal control has the highest final
accuracy in this cohort despite its later crossing.

These two-seed results support faster early generalization from complex
products at the frozen AdamW settings, not optimality of the block or optimizer.
They do not prove that the learned features are characters or satisfy a
flat-spectrum recovery certificate. No width, depth, optimizer or learning-rate
sweep was performed here. The runs total 84.32 seconds including evaluation,
setup within each run and checkpoint I/O; cohort wall time is 85.08 seconds.
Timing is descriptive, not a controlled throughput benchmark.
