//! CLI and frozen scientific protocol. No training/scoring calls into Python.
use crate::{
    application::{self, Backend},
    domain::{
        Result,
        data::{Data, Plan},
        model::{self, Arm, STEPS},
    },
    infrastructure::{
        engine::Engine,
        storage::{self, Recorder},
    },
};
use serde_json::{Value, json};
use std::{fs, path::Path, time::Instant};

pub fn source_hash() -> String {
    storage::hash(
        concat!(
            include_str!("main.rs"),
            include_str!("application.rs"),
            include_str!("interfaces.rs"),
            include_str!("domain/mod.rs"),
            include_str!("domain/data.rs"),
            include_str!("domain/model.rs"),
            include_str!("infrastructure/mod.rs"),
            include_str!("infrastructure/engine.rs"),
            include_str!("infrastructure/gemm.rs"),
            include_str!("infrastructure/ops.rs"),
            include_str!("infrastructure/product.rs"),
            include_str!("infrastructure/rotate.rs"),
            include_str!("infrastructure/storage.rs"),
            include_str!("../Cargo.toml"),
            include_str!("../Cargo.lock")
        )
        .as_bytes(),
    )
}
pub fn protocol() -> Value {
    let ptx_sha256 = storage::hash(
        [
            crate::infrastructure::ops::kernels::PTX,
            crate::infrastructure::rotate::kernels::PTX,
            crate::infrastructure::gemm::kernels::PTX,
            crate::infrastructure::product::kernels::PTX,
        ]
        .concat()
        .as_bytes(),
    );
    json!({"task":"(a+b)^3 mod97","source_sha256":source_hash(),"ptx_sha256":ptx_sha256,"kernite_commit":"a1b6bc2c956e1a5f35960e26b209e1b6c213096c",
        "course_commit":"a3eb468","kernel_source_gpt_commit":"786696b","backend":"Rust/Kernite FP32 CUDA; no TF32",
        "arms":Arm::ALL.map(|a|a.name()),"seeds":[7,11],"steps":STEPS,"epochs":1000,
        "width_real":128,"depth":1,"hidden_real_swiglu":341,"hidden_complex":341,"independent_real_parameters":143360,
        "optimizer":"coordinate AdamW","learning_rate":0.001,"weight_decay":1.0,"betas":[0.9,0.98],"epsilon":1e-8,"warmup_updates":10,
        "rms_epsilon":f32::EPSILON,"batch":512,"tail":96,"train_count":4704,"validation_count":4705,
        "checkpoint_every_epochs":500,"report_every_updates":100,"stop_on_99":false,"seconds_cap_per_run":600,
        "primary":"final heldout accuracy and first observed 99% crossing; report all seeds and later dips",
        "order":"rotate the four-arm order across seeds",
        "formula":"n(E[a]+J E[b]); x+n(FF(n(x))); logits=n(x)E^T",
        "products":{"complex-diagonal":"sigmoid(sqrt(|g|^2+eps))*(gR*uR, gI*uI)",
            "complex-product-radial":"sigmoid(sqrt(|g|^2+eps))*g*u/sqrt(2)","complex-product-plain":"g*u/sqrt(2)"},
        "limitations":["SwiGLU comparison also changes projection constraints and hidden representation",
            "RMS backward uses separated FP64 radial/tangent calculation from native GPT; kernels differ from Torch",
            "initial complex component variance matches real components; compute and weight-decay geometry are not matched",
            "numerical experiment, not a theorem or architecture promotion"]})
}
fn identity(arm: Arm, seed: u64, data: &Data, plan: &Plan, p: &[f32]) -> Value {
    json!({"arm":arm.name(),"seed":seed,"source_sha256":source_hash(),"protocol_sha256":storage::hash(&serde_json::to_vec(&protocol()).unwrap()),
        "train_sha256":storage::hash(&storage::words(&data.train)),"validation_sha256":storage::hash(&storage::words(&data.validation)),
        "order_sha256":storage::hash(&storage::words(&plan.order)),"initial_sha256":storage::hash(&storage::floats(p)),
        "embedding_sha256":storage::hash(&storage::floats(&p[..model::E])),"stored_parameters":p.len(),"independent_parameters":143360})
}
fn run_cohort(root: &Path) -> Result<()> {
    if root.exists() {
        return Err("output directory already exists; use a fresh directory (existing runs are never overwritten)".into());
    }
    fs::create_dir_all(root)?;
    storage::json_write(&root.join("protocol.json"), &protocol())?;
    let cohort_start = Instant::now();
    let mut results = Vec::new();
    for (index, seed) in [7u64, 11].into_iter().enumerate() {
        let setup = Instant::now();
        let data = Data::new(seed);
        let plan = Plan::new(seed, STEPS);
        let setup_seconds = setup.elapsed().as_secs_f64();
        for j in 0..4 {
            let arm = Arm::ALL[(j + index) % 4];
            let p = model::initialize(arm, seed);
            let input = identity(arm, seed, &data, &plan, &p);
            let directory = root.join(format!("{}-seed{seed}", arm.name()));
            let mut recorder = Recorder::new(directory.clone(), input)?;
            let outcome = (|| -> Result<Value> {
                let engine = Engine::new(arm, &p, &data, &plan)?;
                let completed = application::train(&engine, &plan, 0, &mut recorder)?;
                let mut result = recorder.summary(completed);
                result["status"] = json!(if completed == STEPS {
                    "complete"
                } else {
                    "stopped"
                });
                result["input_setup_seconds"] = json!(setup_seconds);
                Ok(result)
            })();
            let result=outcome.unwrap_or_else(|error|json!({"arm":arm.name(),"seed":seed,"status":"error","error":error.to_string()}));
            storage::json_write(&directory.join("result.json"), &result)?;
            results.push(result);
            storage::json_write(
                &root.join("results.json"),
                &json!({"protocol":protocol(),"runs":results,"wall_seconds":cohort_start.elapsed().as_secs_f64()}),
            )?;
        }
    }
    Ok(())
}
fn audit(root: &Path) -> Result<()> {
    let saved_protocol: Value = serde_json::from_slice(&fs::read(root.join("protocol.json"))?)?;
    if saved_protocol != protocol() {
        return Err("protocol or compiled source mismatch".into());
    }
    let mut checked = Vec::new();
    for seed in [7, 11] {
        let data = Data::new(seed);
        let plan = Plan::new(seed, STEPS);
        for arm in Arm::ALL {
            let directory = root.join(format!("{}-seed{seed}", arm.name()));
            let result: Value = serde_json::from_slice(&fs::read(directory.join("result.json"))?)?;
            if result["status"] != "complete" {
                return Err(format!("incomplete outcome: {}", directory.display()).into());
            }
            let p = model::initialize(arm, seed);
            let want_identity = identity(arm, seed, &data, &plan, &p);
            let mut engine = Engine::new(arm, &p, &data, &plan)?;
            let mut paths = fs::read_dir(&directory)?
                .map(|e| e.map(|e| e.path()))
                .collect::<std::io::Result<Vec<_>>>()?;
            paths.retain(|p| {
                p.file_name()
                    .unwrap()
                    .to_string_lossy()
                    .starts_with("step-")
            });
            paths.sort();
            if paths.len() != 3 {
                return Err("checkpoint cadence differs from initial/500/1000 epochs".into());
            }
            let mut prior = Vec::<Value>::new();
            for (path, expected_step) in paths.into_iter().zip([0, 5000, 10000]) {
                let manifest: Value =
                    serde_json::from_slice(&fs::read(path.join("checkpoint.json"))?)?;
                let bytes = fs::read(path.join("state.bin"))?;
                let history = fs::read(path.join("history.json"))?;
                if manifest["identity"] != want_identity
                    || manifest["state_sha256"] != storage::hash(&bytes)
                    || manifest["history_sha256"] != storage::hash(&history)
                {
                    return Err("checkpoint provenance/hash mismatch".into());
                }
                let (step, state) = storage::decode(&bytes, arm.count())?;
                if step != expected_step || manifest["step"] != step {
                    return Err("checkpoint step mismatch".into());
                }
                let reports: Vec<Value> = serde_json::from_slice(&history)?;
                if !reports.starts_with(&prior) || reports.len() != step / model::REPORT_EVERY + 1 {
                    return Err("history prefix/length mismatch".into());
                }
                for (i, r) in reports.iter().enumerate() {
                    if r["step"] != i * model::REPORT_EVERY {
                        return Err("report step mismatch".into());
                    }
                }
                if step == 0 && state.parameters != p {
                    return Err("initial parameters changed".into());
                }
                engine.restore(&state)?;
                let report = reports.last().unwrap();
                for (name, validation) in [("train", false), ("validation", true)] {
                    let actual = engine.evaluate(validation)?;
                    if report[name]["correct"] != actual.correct
                        || (report[name]["loss"].as_f64().unwrap() - actual.loss).abs() > 1e-10
                    {
                        return Err(format!(
                            "metric replay mismatch: {} step={step} {name}",
                            arm.name()
                        )
                        .into());
                    }
                }
                if step == STEPS {
                    let first = reports
                        .iter()
                        .find(|r| r["validation"]["correct"].as_u64().unwrap() >= 4658)
                        .map(|r| r["step"].clone())
                        .unwrap_or(Value::Null);
                    if result["first99_step"] != first
                        || result["final"] != *report
                        || result["reports"] != json!(reports)
                    {
                        return Err("summary/history mismatch".into());
                    }
                }
                prior = reports;
                checked.push(json!({"arm":arm.name(),"seed":seed,"step":step,"status":"pass"}));
            }
        }
    }
    storage::json_write(
        &root.join("audit.json"),
        &json!({"source_sha256":source_hash(),"status":"pass","checkpoints":checked}),
    )?;
    println!(
        "PASS: all 24 checkpoints replay exactly; splits, paired initialization, sampler, summaries and cadence verified"
    );
    Ok(())
}
pub fn run() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();
    match args.get(1).map(String::as_str) {
        Some("protocol") => {
            println!("{}", serde_json::to_string_pretty(&protocol())?);
            Ok(())
        }
        Some("run") if args.len() == 3 => run_cohort(Path::new(&args[2])),
        Some("audit") if args.len() == 3 => audit(Path::new(&args[2])),
        _ => Err("usage: rotate90-complex-kernite protocol | run OUTPUT | audit OUTPUT".into()),
    }
}
