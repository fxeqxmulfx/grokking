//! Training policy and backend contract; no third-party dependencies.
use crate::domain::{
    Result,
    data::Plan,
    model::{REPORT_EVERY, SAVE_EVERY},
};

#[derive(Clone, Debug)]
pub struct Metrics {
    pub loss: f64,
    pub correct: usize,
    pub count: usize,
}
#[derive(Clone, Debug)]
pub struct Report {
    pub step: usize,
    pub train: Metrics,
    pub validation: Metrics,
}
pub struct State {
    pub parameters: Vec<f32>,
    pub first: Vec<f32>,
    pub second: Vec<f32>,
}

pub trait Backend {
    fn train_step(&self, offset: usize, batch: usize, step: usize) -> Result<()>;
    fn evaluate(&self, validation: bool) -> Result<Metrics>;
    fn state(&self) -> Result<State>;
    fn restore(&mut self, state: &State) -> Result<()>;
}
pub trait Observer {
    fn report(&mut self, report: Report) -> Result<()>;
    fn save(&mut self, completed: usize, state: &State) -> Result<()>;
    fn stop_requested(&self) -> bool;
}

/// Fixed horizon, complete split evaluation, and sparse durable checkpoints.
/// No early stop on 99%: later losses of generalization remain observable.
pub fn train(
    backend: &impl Backend,
    plan: &Plan,
    from: usize,
    observer: &mut impl Observer,
) -> Result<usize> {
    let steps = plan.boundaries.len() - 1;
    if from > steps {
        return Err("checkpoint beyond plan".into());
    }
    if from == 0 {
        observer.report(Report {
            step: 0,
            train: backend.evaluate(false)?,
            validation: backend.evaluate(true)?,
        })?;
        observer.save(0, &backend.state()?)?;
    }
    for step in from + 1..=steps {
        let start = plan.boundaries[step - 1];
        backend.train_step(start, plan.boundaries[step] - start, step)?;
        let stop = observer.stop_requested();
        if step % REPORT_EVERY == 0 || step == steps || stop {
            observer.report(Report {
                step,
                train: backend.evaluate(false)?,
                validation: backend.evaluate(true)?,
            })?;
        }
        if step % SAVE_EVERY == 0 || step == steps || stop {
            observer.save(step, &backend.state()?)?;
        }
        if stop {
            return Ok(step);
        }
    }
    Ok(steps)
}
