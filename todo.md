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

## Lean, in the transformer repository

Work in the worktree `.claude/worktrees/rank-one-recovery`; land each commit on `main` by
fast-forward and check `main`'s head before submitting.

- [ ] **χ(ab) from Theorem G.** For a multiplicative character χ of `ZMod p` (Mathlib's
      `MulChar` sends non-units to 0), M recovers `χ(a)χ(b)` from Ω exactly when the cells
      of Ω with `a, b ≠ 0` are rigid on the units and contain a permutation of them. The
      zero row and column need no cell. A faithful χ matters only to read `ab` back. Route:
      Theorem G for vectors of modulus one on their support, then Hall
      (`Finset.all_card_le_biUnion_card_iff_exists_injective`, as in Theorem E.3).
      Then the home page's `hand('G and Hall')` becomes `lean`, in three languages, and the
      χ check (12 training splits, all recovered) goes into `review/flat_spectrum.md`.
- [ ] **Rigidity is connectivity.** Rigid on the supports ⇔ the bipartite graph of Ω on the
      nonzero rows and columns is connected; so a rigid pattern has at least `2N − 1` cells.
      The home page marks it `hand('graphs')`.
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
- [ ] Keep the phone-width probe:
      `/tmp/claude-1000/-home-misha-lean-projects-transformer/7f8c1b5b-fb83-40a0-b148-1aad6935ee9c/scratchpad/overflow.mjs`
      loads pages at a set width in headless Chrome (DevTools protocol, `Emulation.setDeviceMetricsOverride`) and
      lists every formula or tag that leaves its column. Move it to `site/scripts/`.
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
