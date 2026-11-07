//! CPU invariants and independent FP64/CUDA numerical checks.
use crate::{
    application::{self, Backend, Metrics, Observer, Report, State},
    domain::{
        Result,
        data::{Data, Plan, Random},
        model::{self, Arm, E, H, W},
    },
    infrastructure::{engine::Engine, ops, product, reference, storage},
};
use kernite_cuda::{Cuda, Grid};

#[test]
fn historical_splits_and_complete_epoch_sampling() {
    let fixtures: serde_json::Value =
        serde_json::from_str(include_str!("../historical_splits.json")).unwrap();
    for fixture in fixtures["rows"].as_array().unwrap() {
        let seed = fixture["seed"].as_u64().unwrap();
        let data = Data::new(seed);
        assert_eq!(
            fixture["validation_u32_sha256"],
            storage::hash(&storage::words(&data.validation))
        );
        let mut seen = vec![false; 97 * 97];
        for row in data
            .train
            .as_chunks::<3>()
            .0
            .iter()
            .chain(data.validation.as_chunks::<3>().0.iter())
        {
            assert_eq!(row[2], (row[0] + row[1]).pow(3) % 97);
            let at = (97 * row[0] + row[1]) as usize;
            assert!(!seen[at]);
            seen[at] = true;
        }
        assert!(seen.into_iter().all(|b| b));
        let plan = Plan::new(seed, 20);
        for chunk in plan.order.as_chunks::<4704>().0.iter() {
            let mut rows = chunk.to_vec();
            rows.sort_unstable();
            assert_eq!(rows, (0..4704).collect::<Vec<u32>>());
        }
        for (i, pair) in plan.boundaries.windows(2).enumerate() {
            assert_eq!(pair[1] - pair[0], if i % 10 == 9 { 96 } else { 512 });
        }
        assert_eq!(plan.order[..4704], Plan::new(seed, 10).order);
    }
}

#[test]
fn parameter_owners_partition_storage_and_match_budget() {
    assert_eq!(Arm::Swiglu.count(), 143360);
    let map = model::pairs();
    assert_eq!(2 * map.len(), 143360);
    let mut seen = vec![0; Arm::Product.count()];
    for &[a, b, c, d, kind] in &map {
        for i in if kind == 1 {
            vec![a, b]
        } else {
            vec![a, b, c, d]
        } {
            seen[i as usize] += 1;
        }
    }
    assert!(seen.into_iter().all(|n| n == 1));
    for seed in [7, 11] {
        let real = model::initialize(Arm::Swiglu, seed);
        let complex = model::initialize(Arm::Product, seed);
        assert_eq!(real[..E], complex[..E]);
        for arm in [Arm::Diagonal, Arm::Product, Arm::Plain] {
            assert_eq!(complex, model::initialize(arm, seed));
            assert!(model::valid(arm, &complex));
        }
        // Check every expanded matrix's action against direct complex multiplication.
        for (off, n, k, output_adjacent, input_adjacent) in [
            (E, 2 * H, W, false, true),
            (E + 2 * H * W, 2 * H, W, false, true),
            (E + 4 * H * W, W, 2 * H, true, false),
        ] {
            let x: Vec<f64> = (0..k).map(|i| (i as f64 * 0.13).sin()).collect();
            for r in 0..n / 2 {
                let (rr, ri) = if output_adjacent {
                    (2 * r, 2 * r + 1)
                } else {
                    (r, r + n / 2)
                };
                let mut want = [0.0; 2];
                for c in 0..k / 2 {
                    let (cr, ci) = if input_adjacent {
                        (2 * c, 2 * c + 1)
                    } else {
                        (c, c + k / 2)
                    };
                    let a = complex[off + rr * k + cr] as f64;
                    let b = complex[off + ri * k + cr] as f64;
                    want[0] += a * x[cr] - b * x[ci];
                    want[1] += b * x[cr] + a * x[ci];
                }
                for (row, expected) in [(rr, want[0]), (ri, want[1])] {
                    let actual = (0..k)
                        .map(|c| complex[off + row * k + c] as f64 * x[c])
                        .sum::<f64>();
                    assert!((actual - expected).abs() < 1e-12);
                }
            }
        }
    }
}

struct Mock {
    steps: std::cell::Cell<usize>,
}
impl Backend for Mock {
    fn train_step(&self, _offset: usize, _batch: usize, step: usize) -> Result<()> {
        self.steps.set(step);
        Ok(())
    }
    fn evaluate(&self, _validation: bool) -> Result<Metrics> {
        Ok(Metrics {
            loss: 1.0,
            correct: 0,
            count: 1,
        })
    }
    fn state(&self) -> Result<State> {
        Ok(State {
            parameters: vec![self.steps.get() as f32],
            first: vec![0.0],
            second: vec![0.0],
        })
    }
    fn restore(&mut self, state: &State) -> Result<()> {
        self.steps.set(state.parameters[0] as usize);
        Ok(())
    }
}
struct Records {
    saves: Vec<usize>,
    reports: Vec<usize>,
}
impl Observer for Records {
    fn report(&mut self, r: Report) -> Result<()> {
        self.reports.push(r.step);
        Ok(())
    }
    fn save(&mut self, step: usize, _state: &State) -> Result<()> {
        self.saves.push(step);
        Ok(())
    }
    fn stop_requested(&self) -> bool {
        false
    }
}
#[test]
fn saves_only_initial_500_and_1000_epochs() -> Result<()> {
    let backend = Mock {
        steps: std::cell::Cell::new(0),
    };
    let mut records = Records {
        saves: vec![],
        reports: vec![],
    };
    application::train(&backend, &Plan::new(7, 10000), 0, &mut records)?;
    assert_eq!(records.saves, [0, 5000, 10000]);
    assert_eq!(
        records.reports,
        (0..=10000).step_by(100).collect::<Vec<_>>()
    );
    Ok(())
}

#[test]
#[ignore = "requires CUDA"]
fn full_model_forward_and_parameter_directional_derivatives() -> Result<()> {
    let mut data = Data::new(7);
    data.train[..9].copy_from_slice(&[0, 0, 0, 96, 96, 89, 7, 8, 77]);
    // Repeated operands and wraparound exercise both tied-embedding gradient paths.
    let plan = Plan::new(7, 20);
    for arm in Arm::ALL {
        let p = model::initialize(arm, 7);
        let engine = Engine::new(arm, &p, &data, &plan)?;
        let p64: Vec<f64> = p.iter().map(|&x| x as f64).collect();
        for batch in [3, 96, 512] {
            engine.forward(false, 0, batch, false)?;
            let expected = reference::logits(arm, &p64, &data.train[..3 * batch]);
            let actual = engine.logits.read()?;
            let error = actual[..batch * 97]
                .iter()
                .zip(expected)
                .map(|(&x, y)| (x as f64 - y).abs())
                .fold(0.0, f64::max);
            assert!(error < 5e-6, "{arm:?} batch={batch} logit error={error}");
        }
        engine.forward(false, 0, 3, false)?;
        engine.backward(3)?;
        let gradient = engine.gradients.read()?;
        let h = arm.hidden();
        for (group, start, end) in [
            ("embedding", 0, E),
            ("gate/value", E, E + 2 * h * W),
            ("output", E + 2 * h * W, p.len()),
        ] {
            let mut rng = Random(313);
            let mut direction = vec![0.0; p.len()];
            if arm == Arm::Swiglu {
                for d in &mut direction[start..end] {
                    *d = 2.0 * rng.unit() - 1.0;
                }
            } else {
                for [a, b, c, d, kind] in model::pairs() {
                    if (a as usize) < start || (a as usize) >= end {
                        continue;
                    }
                    let re = 2.0 * rng.unit() - 1.0;
                    let im = 2.0 * rng.unit() - 1.0;
                    direction[a as usize] = re;
                    direction[b as usize] = im;
                    if kind == 0 {
                        direction[c as usize] = -im;
                        direction[d as usize] = re;
                    }
                }
            }
            let norm = direction.iter().map(|v| v * v).sum::<f64>().sqrt();
            for d in &mut direction {
                *d /= norm;
            }
            let expected: f64 = gradient
                .iter()
                .zip(&direction)
                .map(|(&g, d)| g as f64 * d)
                .sum();
            let eps = 1e-5;
            let plus: Vec<f64> = p64
                .iter()
                .zip(&direction)
                .map(|(p, d)| p + eps * d)
                .collect();
            let minus: Vec<f64> = p64
                .iter()
                .zip(&direction)
                .map(|(p, d)| p - eps * d)
                .collect();
            let actual = (reference::loss(arm, &plus, &data.train[..9])
                - reference::loss(arm, &minus, &data.train[..9]))
                / (2.0 * eps);
            assert!(
                (actual - expected).abs() < 2e-5 + 2e-4 * actual.abs(),
                "{arm:?} {group}: GPU={expected}, finite diff={actual}"
            );
        }
    }
    Ok(())
}

#[test]
#[ignore = "requires CUDA"]
fn product_forward_and_gradient_include_zero_radius() -> Result<()> {
    let cuda = Cuda::new()?;
    let k = product::kernels::Kernels::load(&cuda)?;
    let pairs = 7usize;
    let rows = 3usize;
    let mut x: Vec<f32> = (0..4 * pairs * rows)
        .map(|i| (i as f32 * 0.17).sin())
        .collect();
    x[0] = 0.0;
    x[pairs] = 0.0;
    let dy: Vec<f32> = (0..2 * pairs * rows)
        .map(|i| (i as f32 * 0.23).cos())
        .collect();
    let bx = cuda.upload(&x)?;
    let bg = cuda.upload(&dy)?;
    let y = cuda.alloc::<f32>(dy.len())?;
    let dx = cuda.alloc::<f32>(x.len())?;
    for arm in [Arm::Diagonal, Arm::Product, Arm::Plain] {
        // SAFETY: the four input planes and two output planes cover every bounded kernel index.
        unsafe {
            macro_rules! launch {
                ($mode:literal) => {{
                    k.product::<$mode>(
                        Grid::new(1, 256),
                        y.ptr(),
                        bx.ptr(),
                        pairs as u32,
                        (pairs * rows) as u32,
                    )?;
                    k.product_bwd::<$mode>(
                        Grid::new(1, 256),
                        dx.ptr(),
                        bx.ptr(),
                        bg.ptr(),
                        pairs as u32,
                        (pairs * rows) as u32,
                    )?;
                }};
            }
            match arm {
                Arm::Diagonal => launch!(0),
                Arm::Product => launch!(1),
                Arm::Plain => launch!(2),
                Arm::Swiglu => unreachable!(),
            }
        }
        let actual = y.read()?;
        let gradient = dx.read()?;
        for row in 0..rows {
            for c in 0..pairs {
                let at = row * 4 * pairs + c;
                let out = row * 2 * pairs + c;
                let z = std::array::from_fn(|i| x[at + i * pairs] as f64);
                let want = reference::product(z, arm);
                for j in 0..2 {
                    assert!((actual[out + j * pairs] as f64 - want[j]).abs() < 2e-6);
                }
                for j in 0..4 {
                    let mut plus = z;
                    let mut minus = z;
                    plus[j] += 1e-6;
                    minus[j] -= 1e-6;
                    let a = reference::product(plus, arm);
                    let b = reference::product(minus, arm);
                    let d = ((a[0] - b[0]) * dy[out] as f64
                        + (a[1] - b[1]) * dy[out + pairs] as f64)
                        / 2e-6;
                    assert!(
                        (gradient[at + j * pairs] as f64 - d).abs() < 2e-6,
                        "{arm:?}, derivative {j}"
                    );
                }
            }
        }
    }
    Ok(())
}

#[test]
#[ignore = "requires CUDA"]
fn adamw_contracts_complex_gradients_and_uses_first_warmup_rate() -> Result<()> {
    let data = Data::new(7);
    let plan = Plan::new(7, 20);
    for arm in [Arm::Swiglu, Arm::Product] {
        let p = model::initialize(arm, 7);
        let mut engine = Engine::new(arm, &p, &data, &plan)?;
        let g: Vec<f32> = (0..p.len())
            .map(|i| 0.02 * (i as f32 * 0.13).sin())
            .collect();
        engine.gradients.write(&g)?;
        engine.update(1)?;
        let state = engine.state()?;
        let indices: Vec<(usize, f64)> = if arm == Arm::Swiglu {
            g.iter().enumerate().map(|(i, &g)| (i, g as f64)).collect()
        } else {
            model::pairs()
                .into_iter()
                .flat_map(|[a, b, c, d, kind]| {
                    let ga = if kind == 0 {
                        g[a as usize] + g[d as usize]
                    } else {
                        g[a as usize]
                    };
                    let gb = if kind == 0 {
                        g[b as usize] - g[c as usize]
                    } else {
                        g[b as usize]
                    };
                    [(a as usize, ga as f64), (b as usize, gb as f64)]
                })
                .collect()
        };
        for (i, g) in indices {
            let want = p[i] as f64 * (1.0 - 0.0001) - 0.0001 * g / (g.abs() + 1e-8);
            assert!((state.parameters[i] as f64 - want).abs() < 2e-8);
            assert!((state.first[i] as f64 - 0.1 * g).abs() < 2e-9);
            assert!((state.second[i] as f64 - 0.02 * g * g).abs() < 2e-10);
        }
        assert!(model::valid(arm, &state.parameters));
    }
    Ok(())
}

#[test]
#[ignore = "requires CUDA"]
fn checkpoint_continuation_through_tail_and_warmup_is_exact() -> Result<()> {
    let data = Data::new(11);
    let plan = Plan::new(11, 20);
    for arm in Arm::ALL {
        let p = model::initialize(arm, 11);
        let uninterrupted = Engine::new(arm, &p, &data, &plan)?;
        for step in 1..=9 {
            let offset = plan.boundaries[step - 1];
            uninterrupted.train_step(offset, plan.boundaries[step] - offset, step)?;
        }
        let bytes = storage::state_bytes(9, &uninterrupted.state()?);
        let (step, state) = storage::decode(&bytes, p.len())?;
        assert_eq!(step, 9);
        let mut resumed = Engine::new(arm, &p, &data, &plan)?;
        resumed.restore(&state)?;
        for step in 10..=14 {
            let offset = plan.boundaries[step - 1];
            let batch = plan.boundaries[step] - offset;
            uninterrupted.train_step(offset, batch, step)?;
            resumed.train_step(offset, batch, step)?;
        }
        assert_eq!(
            storage::state_bytes(14, &uninterrupted.state()?),
            storage::state_bytes(14, &resumed.state()?)
        );
    }
    Ok(())
}

#[test]
#[ignore = "requires CUDA"]
fn loss_argmax_handles_ties_and_overwrites_previous_hits() -> Result<()> {
    let cuda = Cuda::new()?;
    let k = ops::kernels::Kernels::load(&cuda)?;
    let logits = cuda.alloc::<f32>(97)?;
    let grad = cuda.alloc::<f32>(97)?;
    let losses = cuda.alloc::<f32>(1)?;
    let hits = cuda.alloc::<u32>(1)?;
    let mut target = cuda.upload(&[0u32])?;
    for label in [0, 96, 0, 1] {
        target.write(&[label])?;
        // SAFETY: one valid warp, 97 logits/gradients, one target/loss/hit.
        unsafe {
            k.loss(
                Grid::new(1, 128),
                grad.ptr(),
                losses.ptr(),
                hits.ptr(),
                logits.ptr(),
                target.ptr(),
                1,
            )?;
        }
        for (i, g) in grad.read()?.into_iter().enumerate() {
            assert!((g - (1.0 / 97.0 - if i == label as usize { 1.0 } else { 0.0 })).abs() < 1e-7);
        }
        assert_eq!(hits.read()?, vec![u32::from(label == 0)]);
        assert!((losses.read()?[0] - 97.0f32.ln()).abs() < 1e-6);
    }
    Ok(())
}
