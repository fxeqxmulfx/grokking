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
- [ ] The rest of *Not formalized* in `review/flat_spectrum.md`: two diagonals minus one cell
      are rigid; `‖Y − Q‖_op = cos(π/p)`; the exact norm of the witness `J − t 1_R 1_Cᵀ`.

## Site

- [ ] Recovery page: Theorem G in its status, in three languages (`spec.ts`, Lean names
      `forall_isMinOn_vecMulVec_iff_support`,
      `forall_isMinOn_vecMulVec_iff_exists_transport_support`,
      `rigid_support_iff_of_ne_zero`), with the zero-entry numbers.
- [ ] Recovery page: the N = 4 card goes from `running` to `numerical`. Waits for the N = 4
      sweep (below).
- [ ] Step 2: Rust compiled to `wasm32-unknown-unknown` in `crates/` for the heavy
      computations (nuclear-norm completion, singular values, κ), then the planned pages of
      `site/src/pages/registry.ts`: `start`, `fourier`, `spectrum`, `model`, `flat`,
      `readout`, `weil`, `train`, `frontier`, `status`. They must give introductions for
      students who know analysis up to complex analysis; every theorem, above all those
      that decide whether training converges, Theorem B among them; the hardest function the
      network learns and the simplest one it cannot. Interactive pictures in the manner of
      3Blue1Brown's zeta lesson, previewed locally, never published.

## Numerics

- [ ] **Keep the checks.** The scripts behind the numbers of `review/flat_spectrum.md` and
      of the site (`complete.py`, `patterns.py`, `small.py`, `chi_check.py`, `weighted.py`,
      `cross_weights.py`, `zeros_check.py` and others) exist only in a session scratchpad:
      `/tmp/claude-1000/-home-misha-lean-projects-transformer/7f8c1b5b-fb83-40a0-b148-1aad6935ee9c/scratchpad/rec/`.
      The peak κ and the training predictions come from another scratchpad:
      `/tmp/claude-1000/-home-misha-lean-projects-transformer/f59a2e8a-748c-4f77-9056-88503d0b17c1/scratchpad/train/`
      (`kappa.py`, `tasks.py`, `drive.py`, `kappa.json`, `runs/`, `train.log`).
      Move both into `experiments/` here, as a uv project, before those directories go.
- [ ] **The optimizer.** The course's network trains with Schedule-Free AdamW, but the runs
      it quotes (the ten κ predictions, parity-cubic) used AdamW: `grok-simple.py` in
      `~/rust_projects/grokking_abmod/scripts`, lr 1e-3, betas 0.9/0.98, weight decay 1,
      batch 512, which has no Schedule-Free option. Rerun them with Schedule-Free AdamW on
      the GPU, or keep saying AdamW. `ScheduleFreeAdamW` is in
      `~/lean_projects/transformer/optimizers/src/lean_optim`; `compare-rotate90.py` in the
      same `scripts/` directory shows how it is wired (`optimizer: schedule_free_adamw`).
- [ ] **The N = 4 sweep** of every pattern runs in the background, into `small4_out.txt` in
      the scratchpad above; three of its four classes are printed (56 287 patterns). When it
      ends: the table in `review/flat_spectrum.md` (*Exhaustive check*) and the site's card.

## Open, for the next cycles

- Rank above one: when does M recover a table of rank `r`? Theorem G is `r = 1`.
- Real readouts `cos/sin(2πrf/p)`: the least-norm fill is right except one cell; numerical
  only.
- The readout-free version: the least `r_eff(φ∘f)` over readouts φ. The peak κ separates
  22 tasks and predicted ten runs; its converse fails (parity-cubic).
- Training ≈ M: a heuristic. Nothing proves that the network behaves like model M.

## When the cycle ends

- Remove the worktree and the branch `rank-one-recovery` in the transformer repository.
