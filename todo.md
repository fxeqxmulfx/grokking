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

Work in a fresh worktree (`.claude/worktrees/<name>`, made from `main`); land each commit on
`main` by fast-forward and check `main`'s head before submitting.

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
- [x] **The discontinuity.** `b1700f98`: if `2xy` is an integer, `frac(pxy) = frac(xy)` for
      every odd `p`; for rational `xy` with denominator `q`, Dirichlet's theorem (Mathlib's
      `Nat.forall_exists_prime_gt_and_eq_mod`) gives every `k/q` with `k` prime to `q`
      infinitely often, so for rational `xy` the limit through the primes exists exactly when
      `2xy` is an integer; the points where `2xy` is an integer have area 0. The irrational
      case needs Vinogradov's equidistribution of `pα` over the primes, which Mathlib lacks,
      and no weaker argument turned up: it stays `hand('Vinogradov')`. On the home page in
      three languages.
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
- [x] **The sharp certificate.** `89bd0c70`: `‖(P_σ + P_τ)/2 − J/N‖_op = cos(π/N)` for every
      pair with `τ σ⁻¹` one `N`-cycle and `N ≥ 2`, reached at a character read along the
      cycle; `c (Y − Q)` is a contraction exactly when `|c| cos(π/N) ≤ 1`, so Theorem D's
      item 1 holds with `c = 1/cos(π/N)` for `N ≥ 3`, and no larger `c` works for this `Y`
      (review item D.11). No page quotes Theorem D's constant, so the site is unchanged.
- [x] **Rank above one.** `57e74719`, `51365133`: Theorem D's certificate at every rank
      (`isMinOn_iff_of_certificate`: `K = U S Vᴴ`, a `W` with `Uᴴ W = 0`, `W V = 0`,
      `‖W‖_op < 1` making `U Vᴴ + W` vanish off Ω, and no nonzero `U Aᴴ + B Vᴴ` vanishing on
      Ω); the necessary condition (`reachable_of_forall_isMinOn`: the cells of Ω where `K ≠ 0`
      join the row and the column of every nonzero entry); the `2 × 2` table from three cells
      (`forall_isMinOn_threeCells_iff`: recovered exactly when `k₀₁ = conj(k₁₀) k₀₀ k₁₁ /
      max(|k₁₀|², |k₀₀ k₁₁|)`), so `[[2, 1], [1, 1]]` is recovered and `[[2, 1], [1, −1]]`, of
      the same moduli, is not; and the certificate's second condition is not necessary
      (`exists_ne_zero_threeCells_of_det_ne_zero`). Numerically: grokking `e5cfbe6`, review
      `e6c15b9b`; on the home page: `c59f26c`.

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
      3Blue1Brown's zeta lesson, previewed locally; a push to `main` publishes the site on
      https://fxeqxmulfx.github.io/grokking/ (`57eb6f8`).

## Numerics

- [x] **Keep the checks**, recovery part: `experiments/recovery` (`7517446`, `c630fdd`).
- [x] **Keep the checks**, training part: `experiments/training` (`3cc0aef`). Was: The peak κ and the training predictions come from a
      session scratchpad:
      `/tmp/claude-1000/-home-misha-lean-projects-transformer/f59a2e8a-748c-4f77-9056-88503d0b17c1/scratchpad/train/`
      (`kappa.py`, `tasks.py`, `drive.py`, `kappa.json`, `runs/`, `train.log`).
      Move them into `experiments/` here, as a uv project, before that directory goes.
- [ ] **The optimizer.** Rerun done (`3cc0aef`): Schedule-Free AdamW at 1e-3, 0.01 and 0.03
      splits the 13 tasks as AdamW does, 2.5 to 5 times slower at 1e-3. Left: say so on the
      site, in three languages, with the κ values of `experiments/training/README.md`. Was:
      The course's network trains with Schedule-Free AdamW, but the runs
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

- [x] Done, transformer `49776341` (items 5.1–5.4), numerics in grokking `93cecb9`; then
  **linear growth** (item 6): `733ec189` (exactly item 1.2's hypotheses), `4848e3d6` (full
  rank and `[[2, 1], [1, 1]]` recover without it, `‖K + h E₀₁‖_S1 = √(9 + h²)`), `9c4b4e68`
  (it needs `r (m + n − r)` cells). Next: the review's *Rank check* in the transformer repo
  still lacks the item 5 numbers of `rank` and `polar` (cite `93cecb9`); the home page lacks
  item 6 (FULL_LEAN names in `exists_pos_le_nuclearNorm_add_iff`,
  `isMinOn_iff_of_exists_pos_le_nuclearNorm_add`,
  `not_exists_pos_le_nuclearNorm_add_of_full_column_rank`, `…_of_full_row_rank`,
  `nuclearNorm_add_smul_single_threeCells`, `not_exists_pos_le_nuclearNorm_add_threeCells`,
  `card_mul_add_le_ncard_of_tangent`, `card_mul_add_le_ncard_of_exists_pos_le_nuclearNorm_add`);
  a numerical check of linear against quadratic growth is open.
  Was: **Theorem A at every rank.** `K = U S Vᴴ` with `S > 0` is
  a minimum of M exactly when some `W` with `Uᴴ W = 0`, `W V = 0` and `‖W‖_op ≤ 1` makes
  `U Vᴴ + W` vanish off Ω (for invertible `K`, `W = 0` and this is Theorem A). Route: the
  analytic Hahn–Banach theorem (`exists_extension_of_le_sublinear`) extends `t K + H ↦
  t ‖K‖_S1` from `ℝ K + L` to a functional `Re tr(Yᴴ ·) ≤ ‖·‖_S1`; then `‖Y‖_op ≤ 1`,
  `Y = 0` off Ω, `Re tr(Yᴴ K) = ‖K‖_S1`, which forces `Y V = U` and `Yᴴ U = V`. The rank
  check agrees: on the 649 injective patterns without a certificate below 1, `K` was not even
  a minimum. Uniqueness has no such criterion: injectivity is not necessary (item 4), as the
  nuclear-norm ball is not polyhedral.
- **Not unique, but correct?** (user, 2026-10-29: "ok, result not unique, but maybe also
  correct?"). Three cases: `K` the only minimum; `K` one of several (one diagonal: every
  `X ⪰ 0` with unit diagonal after the transfer to `J`, so `K`, `Z` and the segment between
  them, which decodes right off `Z`, but also minima with wrong signs); `K` no minimum (the
  cross; `2 × 2` of rank 2 with moduli one from three cells, where M always fills the cell
  as if the rank were one). The network is scored by its argmax, so the notion for learning
  is "every minimum of M decodes to `f` on the hidden cells". State it, prove it where it
  differs from uniqueness, and measure it.
- **Minimum data** (user, 2026-10-29: "what minimum data we need, experiments show sometimes
  20% random pairs enough"). For M and a rank-one table, `2p − 1` designed cells suffice and
  are needed (*The fewest cells*); random cells recover it exactly when they connect the rows
  with the columns and contain a permutation, which for random cells happens near the
  fraction `log p / p` (Erdős–Rényi; about 5% at `p = 97`). Measure the network's threshold:
  train fractions 5% to 50%, both seeds, add and mul, with the criterion computed on the same
  splits. The gap between M and the network is the training step.
- **Several variables, an angle per variable** (user, 2026-10-29: "what if we also test
  multivariables? also use rotate, not only 90, every var take you own angle, as rope").
  Tasks `f(x₁, …, x_k)` mod p for `k = 3` (`a + b + c`, `abc`, `ab + c`, …), with the input
  `n(Σ_t R(θ_t) E[x_t])`: one angle `θ_t` per variable, and RoPE-style frequencies, the pair
  `j` turned by `t ω_j`. In `experiments/training`.
- Real readouts `cos/sin(2πrf/p)`: the least-norm fill is right except one cell; numerical
  only.
- The readout-free version: the least `r_eff(φ∘f)` over readouts φ. The peak κ separates
  22 tasks and predicted ten runs; its converse fails (parity-cubic).
- Training ≈ M: a heuristic. Nothing proves that the network behaves like model M.

## When the cycle ends

- [x] Removed the worktree and the branch `rank-one-recovery` in the transformer repository
  (2026-10-29).
