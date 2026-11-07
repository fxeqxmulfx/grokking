//! Immutable checkpoint directories: parameters, AdamW moments, step and full history.
//! A checkpoint binds the compiled source, input bytes, sampler and experiment protocol.
use crate::{
    application::{Metrics, Observer, Report, State},
    domain::Result,
};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{
    fs::{self, File},
    io::Write,
    path::{Path, PathBuf},
    time::Instant,
};

pub fn hash(bytes: &[u8]) -> String {
    Sha256::digest(bytes)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}
pub fn words(values: &[u32]) -> Vec<u8> {
    values.iter().flat_map(|x| x.to_le_bytes()).collect()
}
pub fn floats(values: &[f32]) -> Vec<u8> {
    values.iter().flat_map(|x| x.to_le_bytes()).collect()
}
pub fn json_write(path: &Path, value: &Value) -> Result<()> {
    let mut file = File::create(path)?;
    file.write_all(&serde_json::to_vec_pretty(value)?)?;
    file.write_all(b"\n")?;
    file.sync_all()?;
    Ok(())
}
pub fn metric(m: &Metrics) -> Value {
    json!({"loss":m.loss,"correct":m.correct,"count":m.count,"accuracy":m.correct as f64/m.count as f64})
}
pub fn report_value(r: &Report) -> Value {
    json!({"step":r.step,"epoch":r.step as f64/10.0,"train":metric(&r.train),"validation":metric(&r.validation)})
}
pub fn state_bytes(step: usize, state: &State) -> Vec<u8> {
    let mut bytes = (step as u64).to_le_bytes().to_vec();
    for values in [&state.parameters, &state.first, &state.second] {
        bytes.extend(floats(values));
    }
    bytes
}
pub fn decode(bytes: &[u8], count: usize) -> Result<(usize, State)> {
    if bytes.len() != 8 + 12 * count {
        return Err("bad checkpoint length".into());
    }
    let step = u64::from_le_bytes(bytes[..8].try_into()?) as usize;
    let values: Vec<f32> = bytes[8..]
        .as_chunks::<4>()
        .0
        .iter()
        .map(|b| f32::from_le_bytes(*b))
        .collect();
    if values.iter().any(|x| !x.is_finite()) {
        return Err("nonfinite checkpoint".into());
    }
    Ok((
        step,
        State {
            parameters: values[..count].to_vec(),
            first: values[count..2 * count].to_vec(),
            second: values[2 * count..].to_vec(),
        },
    ))
}

pub struct Recorder {
    pub directory: PathBuf,
    pub identity: Value,
    pub history: Vec<Report>,
    pub started: Instant,
}
impl Recorder {
    pub fn new(directory: PathBuf, identity: Value) -> Result<Self> {
        fs::create_dir(&directory)?;
        json_write(&directory.join("identity.json"), &identity)?;
        Ok(Self {
            directory,
            identity,
            history: Vec::new(),
            started: Instant::now(),
        })
    }
    pub fn summary(&self, step: usize) -> Value {
        let first = self
            .history
            .iter()
            .find(|r| r.validation.correct * 100 >= 99 * r.validation.count);
        let best = self
            .history
            .iter()
            .max_by_key(|r| r.validation.correct)
            .unwrap();
        json!({"arm":self.identity["arm"],"seed":self.identity["seed"],"completed_steps":step,
            "first99_step":first.map(|r|r.step),"first99_epoch":first.map(|r|r.step as f64/10.0),
            "best":report_value(best),"final":report_value(self.history.last().unwrap()),
            "seconds":self.started.elapsed().as_secs_f64(),
            "reports":self.history.iter().map(report_value).collect::<Vec<_>>()})
    }
}
impl Observer for Recorder {
    fn report(&mut self, report: Report) -> Result<()> {
        if report.step.is_multiple_of(500) {
            println!(
                "{} seed={} step={} train={:.2}% validation={:.2}%",
                self.identity["arm"],
                self.identity["seed"],
                report.step,
                100.0 * report.train.correct as f64 / report.train.count as f64,
                100.0 * report.validation.correct as f64 / report.validation.count as f64
            );
        }
        self.history.push(report);
        Ok(())
    }
    fn save(&mut self, step: usize, state: &State) -> Result<()> {
        let name = format!("step-{step:06}");
        let temp = self.directory.join(format!(".{name}.pending"));
        fs::create_dir(&temp)?;
        let bytes = state_bytes(step, state);
        let history: Vec<Value> = self.history.iter().map(report_value).collect();
        let history = serde_json::to_vec(&history)?;
        for (name, data) in [("state.bin", &bytes), ("history.json", &history)] {
            let mut file = File::create(temp.join(name))?;
            file.write_all(data)?;
            file.sync_all()?;
        }
        json_write(
            &temp.join("checkpoint.json"),
            &json!({"identity":self.identity,"step":step,
            "state_sha256":hash(&bytes),"history_sha256":hash(&history)}),
        )?;
        File::open(&temp)?.sync_all()?;
        fs::rename(&temp, self.directory.join(name))?;
        File::open(&self.directory)?.sync_all()?;
        Ok(())
    }
    fn stop_requested(&self) -> bool {
        self.directory.join("STOP").exists() || self.started.elapsed().as_secs() >= 600
    }
}
