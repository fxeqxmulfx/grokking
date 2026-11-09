# Experiments

Native experiments document their Cargo commands in their own README. The older
`recovery/` and `training/` directories retain their Python sources as reference material.
New computation uses Rust/Kernite.

| experiment | question |
| --- | --- |
| [`recovery/`](recovery/) | When does model M, the least nuclear norm that agrees with a table on the kept cells, give the table back? Every pattern of small tables against Theorems E, F and G, and the failure margin on 3 × 3 to 7 × 7; ψ(a + b), ψ(a³ + ab) and characters on prime tables, from diagonals, random cells and the training halves, against Theorem D; above rank one, 2 × 2 tables from three cells and random tables of rank 2 and 3 against the rank-r certificate and the necessary condition, and tables of rank 2 to 8, full column rank among them, against the dual criterion for a minimum, read off the solver's dual. |
| [`training/`](training/) | Does the course's network (Rotate90 with SwiGLU and Peri-RMSNorm) learn `f(a, b) mod 97` from half its table, and does the peak κ of the table predict which tasks it learns? 13 tasks, seeds 7 and 11, AdamW and Schedule-Free AdamW; κ of 25 tasks at p = 47, 97, 199. |
| [`rotate90_complex/`](rotate90_complex/) | Does replacing Rotate90's SwiGLU with a complex product help on `(a+b)^3 mod 97`? Native Rust/Kernite; equal parameter budgets, AdamW, seeds 7 and 11, 10000 updates; real SwiGLU, complex diagonal control, radial and plain complex products. |

## Native studies imported from transformer

These 28 studies were copied from [transformer at `ae801acc`](https://github.com/fxeqxmulfx/transformer/blob/ae801acc26fb30b7c3cb5157a2468fda03d076ac/experiments/README.md).
Their Rust sources, Cargo lockfiles, protocols, fixtures and analysis generators are
preserved. Authored findings are in each README; generated reports, plots, logs,
checkpoints and build artifacts stay local and are not part of this import.
The table records the original studies' findings; importing them does not rerun
their training or numerical audits. `inference_efficiency` remains an unfinished
draft with no measured cohort.

Run native commands from this repository unless a README changes directory.
The pinned trainer is the existing `rotate90_complex` source at grokking commit
`b70811e0e0e7ebdc4a8a2e48044c180332f7c40d`. Kernite dependencies use the local
`/home/misha/rust_projects/kgen` checkout at
`a1b6bc2c956e1a5f35960e26b209e1b6c213096c`; build scripts verify the trainer
source hash and Kernite revision. `ROTATE90_SOURCE` can select another checkout
of that same trainer. The main-model comparison also checks its documented GPT
source provenance. Replays require the checkpoints and earlier reports named in
their READMEs; regenerate those upstream inputs in the documented order.

`class_geometry_lr`, `geometry_gap`, `geometry_dynamics`,
`geometry_persistence`, `future_forcing` and `ce_lyapunov` share the
`class_geometry_wsd` Cargo package. Keep the imported directories together:
many packages reuse neighboring experiment modules and fixtures.

Historical commits and `.kanban/artifacts/` evidence paths in these studies
refer to the transformer checkout unless another repository is named. Lean
commands and references to `src/`, `review/`, `scripts/native_index` and
`INDEX.md` also belong there; run those checks in transformer. Theory links
below and in the imported READMEs point to that fixed source revision. The
small number of historical report links point to transformer as well; the
reports themselves are excluded from this copy.

| experiment | evidence | finding |
| --- | --- | --- |
| [`ce_metric`](ce_metric) | 21 Lean theorems, 144 verified checkpoint-fixed metric comparisons | Feature scaling is absorbed in the partial-CE proof, but full raw increases only change from 31 to 30 and ordinary-energy bounds worsen. Neither metric passes the conservative prospective condition on any of the 120 moving cases. |
| [`ce_lyapunov`](ce_lyapunov) | 24 Lean theorems, 144 verified next-minibatch replays | Actual partial CE absorbs arbitrary saved momentum under an explicit step condition. Full AdamW increases the raw potential in 31 cases; all 32 sampled settling updates from step 4000 onward decrease. Future full-model control and reliable discovery remain open. |
| [`future_forcing`](future_forcing) | 144 checkpoint-only windows, 444000 verified future prefixes | Twenty-five Lean theorems remove future-forcing observations from the exact-real bound. Every settling seed retains more than 67.83% active share through the final 500 updates; the long hold remains uncertified, and current moments add only three steps to its 60% guarantee. Reliable discovery remains open. |
| [`geometry_persistence`](geometry_persistence) | 24 complete traces, 96000 hold prefixes and 192 verified finite windows | Ten Lean theorems and realized forcing budgets certify more than 60% active-readout energy through every early-settling hold update. Rank-33 prediction coverage survives at 98.510% over 250 updates and 98.045% over 1000; a single 4000-update jump falls to 0.244%. Discovery remains open. |
| [`geometry_dynamics`](geometry_dynamics) | 240000 readout updates and 744 verified certificate states | Twenty-one Lean theorems bound exact AdamW motion, but the bound is too loose to prove the observed persistence. The new single rank-33 basis reaches 98.565% coverage; a three-basis rank-33 envelope reaches 98.626%, reducing correct-but-uncertified predictions from 403 to 357. Discovery remains open. |
| [`geometry_gap`](geometry_gap) | Eight complete early-settling trajectories; 744 verified certificate states across three cohorts | Earlier LR reduction plus an active-answer basis lifts per-seed late rank-32 coverage minima to 98.11–98.66%. Mean final coverage is 98.504%; correct but uncertified predictions fall from 608 to 403, while incorrect predictions rise from 139 to 160. Zero false certificates; global convergence remains open. |
| [`class_geometry_lr`](class_geometry_lr) | Complete .01 on eight fixed seeds; interrupted .003 evidence retained | Only the peak changes against the main-model .001 WSD recipe. All eight final accuracies improve (mean 99.567% to 99.631%), but late rank-32 coverage minima fall from 89.95–94.69% to 16.07–22.61%. Coverage recovers during cooldown; all numerical audits pass. |
| [`class_geometry_wsd`](class_geometry_wsd) | Same eight paired trajectories and 10000-update budget | The exact selected main-model FP32 AdamW/WSD update passes all audits; 8/8 endpoints exceed 99% accuracy, but none reaches 99% rank-32 coverage, which falls in 6/8 pairs. Every late coverage minimum decreases. |
| [`class_geometry`](class_geometry) | Two original and six replication trajectories; 10000 updates each | Twenty Lean theorems and 80000 update audits: active-class energy share grows from about 33% to 70–76%; all six replications keep at least 93.99% rank-32 coverage at late probes, but none sustains 99%. Coupled alignment and convergence remain unproved. |
| [`readout_geometry`](readout_geometry) | Same two trajectories and 26 frozen probes; equal ranks | Class-visible geometry raises rank-32 endpoint coverage to 99.21%/99.53% and moves first majority coverage to step 500. Nineteen Lean theorems and exact AdamW attribution retain mixed terms; readout credit alone does not determine the actual update. |
| [`transport_forecast`](transport_forecast) | Two original trajectories; 26 frozen probes | Fifteen Lean theorems connect signed training geometry to next-update certificates. Rank-32 endpoint coverage is 96.22%/97.45%, with zero false certificates; first majority coverage does not precede the first sampled 99% accuracy, and later regressions remain. |
| [`inference_efficiency`](inference_efficiency) | Draft; no measured cohort | Native cached-weight and label-free feature-reuse comparison for trainer `b70811e`; saved before completing the cohort runner at the user's commit-only request. |
| [`forecast_tightening`](forecast_tightening) | Same 24 forecast states; no training search | Gram/RMS bounds and a signed final-readout interval raise trained-validation certificate coverage from 90.38% to 99.27%, with zero false certificates; all 18 new Lean theorems and native audits pass. Preparation still costs 1.26 seconds per full query table. |
| [`optimizer_efficiency`](optimizer_efficiency) | 24 source states; 16 fresh CE runs | Compact complex AdamW moments save 47.74% of moment storage and match all 328 paired training observations bitwise; endpoint accuracy 99.45–99.87%. Shared-device timings establish no reliable training speedup. |
| [`forward_normalized`](forward_normalized) | 24 fresh-seed 4000-update runs | Standalone current-gradient A steps at 1% of A's norm fail to repair local training: 2.23–11.63% validation accuracy versus 99.45–99.87% CE; validation CE is worse than original local-pair in all eight cases. |
| [`forward_step`](forward_step) | 40 states; 400 fixed direction/scale probes | At all eight failed local endpoints, the norm-matched current A gradient lowers training/validation CE at every fixed scale; shrinking AdamW still leaves five validation ascent cases. Accuracy remains mixed; no training repair or efficiency claim. |
| [`forward_alignment`](forward_alignment) | 40 states; 280 restored one-step probes | Hidden local loss decreases at all eight failed local endpoints while A-only full-training CE increases in all eight and validation CE in seven. Separate gradient direction, AdamW motion and finite-step effects; 1120 derivative checks pass. |
| [`forward_training`](forward_training) | 32 complete 4000-update runs | Full local pairwise training fails at 2.23–10.50% validation accuracy versus 99.28–99.87% CE; all gradient/source replay checks pass. Retained timings have foreign GPU workloads and establish no efficiency gain. |
| [`forward_forward`](forward_forward) | 24 source states; local readout probes | Directional goodness and a modified pairwise local loss: 19 Lean theorems and all GPU loss/gradient checks pass; the complete training test is in `forward_training`. |
| [`single_update`](single_update) | 24 actual one-step probes | Exact-source attribution, retrospective joint bounds and forecasts frozen before updated-network evaluation. All 225816 feature balls pass; forecasts certify 90.38% of trained validation decisions but no loss-change directions, exposing conservative error propagation. |
| [`adaptive_interaction`](adaptive_interaction) | 24 saved states, 16 intervals; no training | Separate adaptive mixing, saved-moment discrepancy and signed interaction drift; all 6240 adaptive checks pass, but current CE bounds are loose and validation interaction is not monotone. |
| [`residual_dynamics`](residual_dynamics) | 24 saved states, 16 intervals; no training | CE controls projected readout-gradient forcing, while rank-32 orbit readout residuals grow in 11 of 12 CE-descent intervals; separate parameter and basis movement. |
| [`signed_transport`](signed_transport) | 24 saved states; no training | Signed reconstruction and directional residuals raise plain-product rank-32 probability coverage to 70.67%/72.50%; fixed ranks distinguish compressed bounds from full-readout re-expression. |
| [`probability_transfer`](probability_transfer) | 24 saved states; no training | Training confidence and normalized query geometry give valid probability/loss bounds, but the above-half probability condition covers only 0.28%/0.91% at plain-product endpoints. |
| [`loss_geometry`](loss_geometry) | 24 saved states; no training | CE controls probability scatter on the same rows; two training intervals lower CE while raw contrast scatter rises, and held-out scatter can exceed twice training CE. |
| [`contrast_transport`](contrast_transport) | 24 saved states; no training | Training-label and query-state bounds cover 21.06%/29.88% at plain-product endpoints; most coverage comes from training centering, with small covariance gains and no incorrect positive cases. |
| [`answer_contrasts`](answer_contrasts) | 24 saved states; no training | Pooling by cubic answer exposes accurate answer probes and useful measured combined contrasts; conservative L1 and weight-norm budgets still fail. |
| [`flat_approx`](flat_approx) | 24 saved states; no training | Quantitative recovery diagnostic: all native correctness counts reproduce, but the fixed full-character spectral budget fails on every held-out query; direct contrast budgets are useful for most trained queries. |
