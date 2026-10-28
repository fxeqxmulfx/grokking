# Plan

The course works toward the statement in `README.md`. The loop, repeated as long as it
gives something: state the full claim, prove it end to end in Lean, check it numerically,
try to generalize it. When a page needs a result that is not proved, prove it in Lean in
`~/lean_projects/transformer`, under that repository's rules, then put it on the page.

Every task below can start now, unless it names the one thing it waits for.

## Done: the home page states the thesis in full

`#/<lang>/home/full`, written for a professor who may read nothing past the first page.
When a theorem below lands, its tag on the home page changes in all three languages; the
test `the home page makes the same claims, with the same numbers, in every language` keeps
them in step.

- [x] `fr.ts`, `ru.ts`: `fullTitle` and `full`, with the same five sections as `en.ts`
      (`terms`, `proved`, `refined`, `measured`, `unproved`), the same tags and numbers.
- [x] Their leads: `frac(pxy)` has a limit on a null set (the axes and `xy = ½`), not
      "at no point".
- [x] `site/tests/pages.test.ts`: `h3` in `assertBalanced`; the same sections, tags and
      numbers in the three languages.
- [x] Checked at 1280 px, 390 px and 360 px: no formula leaves its column.

## Done: the home page states two theorems and what follows

`b890d34`: one sentence, then its terms made exact (the table, weight decay at its optimum,
which is model M by Lemma 1, rank one and flat, connecting and containing a permutation),
then **Theorem 1** (no incomplete set recovers a flat table without zero entries) and
**Theorem 2** (a rank-one table of modulus-one entries is recovered exactly from the sets
that connect its rows to its columns and contain a permutation), then six conclusions: the
fewest cells, a function with discontinuities of the second kind from an incomplete set,
the readout decides, one hidden cell, the training data, the network. Every Lean claim
lists its declarations; a test checks each against the transformer `INDEX.md`. French and
Russian match the English piece by piece. `c8cae25`: a tag no longer leaves its period
alone at the start of a line.

## Lean, in the transformer repository

Work in the worktree `.claude/worktrees/rank-one-recovery`; land each commit on `main` by
fast-forward and check `main`'s head before submitting.

- [x] **χ(ab) from Theorem G.** On `main` as `542ba3ea`:
      `forall_isMinOn_vecMulVec_iff_equiv_support` (moduli one on supports of the same size:
      rigid there, and a bijection between them inside Ω, by Hall),
      `forall_isMinOn_taskKernel_mul_mulChar_iff`, and for `χ(a + ab) = χ(a) χ(1 + b)`
      `forall_isMinOn_taskKernel_add_mul_mulChar_iff`. The home page says `lean('G and Hall')`
      in three languages; the χ check (12 splits) is in `review/flat_spectrum.md`.
- [x] **Rigidity is connectivity.** `6574a220`: `rigid_support_iff_connected`, and Theorems
      E and G restated with graphs. `6b77e8ee`: no set of fewer than `2N − 1` cells recovers
      every rank-one table of modulus-one entries
      (`two_mul_card_le_ncard_add_one_of_forall_isMinOn`).
- [x] **Weight decay at its optimum is M.** `1aed20a5`: `IsOptimalFit`,
      `forall_isMinOn_iff_iff_isOptimalFit`; `a675e2aa`: Theorems 1 and 2 of the home page in
      that form (`not_exists_isOptimalFit_of_singularValues_eq`,
      `isOptimalFit_vecMulVec_iff_connected`). That training reaches the optimum stays a
      heuristic.
- [x] **The readout decides.** `785e838f`: `not_isMinOn_taskKernel_mul` (the table of `ab`
      itself is recovered from no incomplete set). `679c008b`: `2p − 3` cells recover the
      table of `χ(ab)` for every `χ` (`forall_isMinOn_taskKernel_mul_mulChar_productCells`),
      and no fewer do (`two_mul_sub_three_le_ncard_of_forall_isMinOn`).
- [ ] **The discontinuity.** `frac(pxy)` converges as `p → ∞` through primes iff `2xy ∈ ℤ`.
      The home page marks it `hand('Dirichlet, Vinogradov')`. The rational case needs
      Dirichlet's theorem (look it up with `dt`). The irrational case needs Vinogradov's
      equidistribution of `pα` over primes, which Mathlib lacks: find a weaker argument, or
      it stays `hand`.
- [x] Two diagonals minus any one cell still recover `ψ(a + b)` (`63617153`).
- [x] **The exact witness.** `4943eec7`, `a9e36f03`: `‖J − t 1_R 1_Cᵀ‖²_S1 =
      m n − 2t k l + t² k l + 2|t| g` for every real `t`, least `√(k (n − l)) + √(l (m − k))`
      at `t = 1 − g/(k l)`; some `t` beats `J` iff `k + l > N`. On the site: `eef763e`.
- [x] **The failure margin.** `f192a4aa`: a contraction certifies the least norm
      `√(k (N − l)) + √(l (N − k))` off a `k × l` block; every pattern without a permutation
      has a completion of `J` of norm at most `√(N² − 1) < N − 1/(2N)`; the worst case is
      `√(N² − 1)` for odd `N` and `√2 + √6` for `N = 4`. `da5f79ce`: for every `N`, the
      largest least norm without a permutation is `√(a (a − 1)) + √(b (b − 1))` with
      `a + b = N + 1`, `a ≤ b ≤ a + 1`. `58f6f140`, `5f4dee08`: all of it for every rank-one
      table with entries of modulus one. Numerically on 3 × 3 to 7 × 7 (`30dcce5`); on the
      site: `c867838`, `e677cdd`.
- [ ] `‖Y − Q‖_op = cos(π/p)`, the last item of *Not formalized* in `review/flat_spectrum.md`.

## Site

- [x] Recovery page: Theorem G with the zero-entry numbers, and the N = 4 card (`177fa3b`).
- [x] Recovery page: the slow check's 400 000-step point (`c867838`).
- [ ] Step 2: Rust compiled to `wasm32-unknown-unknown` in `crates/` for the heavy
      computations (nuclear-norm completion, singular values, κ), then the planned pages of
      `site/src/pages/registry.ts`: `start`, `fourier`, `spectrum`, `model`, `flat`,
      `readout`, `weil`, `train`, `frontier`, `status`. They must give introductions for
      students who know analysis up to complex analysis; every theorem, above all those
      that decide whether training converges, Theorem B among them; the hardest function the
      network learns and the simplest one it cannot. Interactive pictures in the manner of
      3Blue1Brown's zeta lesson, previewed locally, never published.

## Numerics

- [x] **Keep the checks**, recovery part: `experiments/recovery` (`7517446`, `c630fdd`).
- [ ] **Keep the checks**, training part. The peak κ and the training predictions come from a
      session scratchpad:
      `/tmp/claude-1000/-home-misha-lean-projects-transformer/f59a2e8a-748c-4f77-9056-88503d0b17c1/scratchpad/train/`
      (`kappa.py`, `tasks.py`, `drive.py`, `kappa.json`, `runs/`, `train.log`).
      Move them into `experiments/` here, as a uv project, before that directory goes.
- [ ] **The optimizer.** The course's network trains with Schedule-Free AdamW, but the runs
      it quotes (the ten κ predictions, parity-cubic) used AdamW: `grok-simple.py` in
      `~/rust_projects/grokking_abmod/scripts`, lr 1e-3, betas 0.9/0.98, weight decay 1,
      batch 512, which has no Schedule-Free option. Rerun them with Schedule-Free AdamW on
      the GPU, or keep saying AdamW. `ScheduleFreeAdamW` is in
      `~/lean_projects/transformer/optimizers/src/lean_optim`; `compare-rotate90.py` in the
      same `scripts/` directory shows how it is wired (`optimizer: schedule_free_adamw`).
- [x] **The N = 4 sweep** of every pattern: all four classes, on the site (`177fa3b`).
- [x] The N = 4 table and the slow check in `review/flat_spectrum.md` (*Exhaustive check*):
      transformer `757c0418`, `15ff9684`.

## Open, for the next cycles

- Rank above one: when does M recover a table of rank `r`? Theorem G is `r = 1`.
- Real readouts `cos/sin(2πrf/p)`: the least-norm fill is right except one cell; numerical
  only.
- The readout-free version: the least `r_eff(φ∘f)` over readouts φ. The peak κ separates
  22 tasks and predicted ten runs; its converse fails (parity-cubic).
- Training ≈ M: a heuristic. Nothing proves that the network behaves like model M.

## When the cycle ends

- Remove the worktree and the branch `rank-one-recovery` in the transformer repository.
