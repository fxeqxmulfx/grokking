//! Preallocated FP32 Kernite execution; GEMM and RMS kernels ported from GPT 786696b.
//! Uses the course's lr=.001, decay=1, betas=(.9,.98), epsilon=1e-8, warmup=10.
use super::{gemm, ops, product, rotate};
use crate::{
    application::{Backend, Metrics, State},
    domain::{
        Result,
        data::{Data, Plan},
        model::{self, Arm, E, W},
    },
};
use kernite_cuda::{Buffer, Cuda, Grid, Ptr};
type F = Buffer<f32>;
type P = Ptr<f32>;
fn grid(count: usize) -> Grid {
    Grid::new(count.div_ceil(256) as u32, 256)
}
fn rows_grid(rows: usize) -> Grid {
    Grid::new(rows.div_ceil(4) as u32, 128)
}

pub struct Engine {
    pub arm: Arm,
    pub parameters: F,
    pub gradients: F,
    first: F,
    second: F,
    ops: ops::kernels::Kernels,
    gemm: gemm::kernels::Kernels,
    product: product::kernels::Kernels,
    rotate: rotate::kernels::Kernels,
    pairs: Buffer<u32>,
    train: Buffer<u32>,
    validation: Buffer<u32>,
    order: Buffer<u32>,
    identity: Buffer<u32>,
    tokens: Buffer<u32>,
    labels: Buffer<u32>,
    embed: F,
    x0: F,
    n1: F,
    gv: F,
    hidden: F,
    branch: F,
    branch_norm: F,
    x1: F,
    last: F,
    pub logits: F,
    pub dlogits: F,
    dlast: F,
    dx1: F,
    dbranch: F,
    dhidden: F,
    dgv: F,
    dn1: F,
    dx0: F,
    dembed: F,
    losses: F,
    hits: Buffer<u32>,
    scratch: F,
}
impl Engine {
    pub fn new(arm: Arm, p: &[f32], data: &Data, plan: &Plan) -> Result<Self> {
        if !model::valid(arm, p)
            || data.train.len() != 4704 * 3
            || data.validation.len() != 4705 * 3
            || data.train.iter().chain(&data.validation).any(|&x| x >= 97)
            || plan.order.is_empty()
            || plan.order.iter().any(|&x| x >= 4704)
        {
            return Err("invalid model or dataset".into());
        }
        let cuda = Cuda::new()?;
        let h = arm.hidden();
        let pairs: Vec<u32> = model::pairs().into_iter().flatten().collect();
        Ok(Self {
            arm,
            parameters: cuda.upload(p)?,
            gradients: cuda.alloc(p.len())?,
            first: cuda.alloc(p.len())?,
            second: cuda.alloc(p.len())?,
            ops: ops::kernels::Kernels::load(&cuda)?,
            gemm: gemm::kernels::Kernels::load(&cuda)?,
            product: product::kernels::Kernels::load(&cuda)?,
            rotate: rotate::kernels::Kernels::load(&cuda)?,
            pairs: cuda.upload(&pairs)?,
            train: cuda.upload(&data.train)?,
            validation: cuda.upload(&data.validation)?,
            order: cuda.upload(&plan.order)?,
            identity: cuda.upload(&(0..4705).collect::<Vec<u32>>())?,
            tokens: cuda.alloc(1024)?,
            labels: cuda.alloc(512)?,
            embed: cuda.alloc(512 * W)?,
            x0: cuda.alloc(512 * W)?,
            n1: cuda.alloc(512 * W)?,
            gv: cuda.alloc(512 * 2 * h)?,
            hidden: cuda.alloc(512 * h)?,
            branch: cuda.alloc(512 * W)?,
            branch_norm: cuda.alloc(512 * W)?,
            x1: cuda.alloc(512 * W)?,
            last: cuda.alloc(512 * W)?,
            logits: cuda.alloc(512 * 97)?,
            dlogits: cuda.alloc(512 * 97)?,
            dlast: cuda.alloc(512 * W)?,
            dx1: cuda.alloc(512 * W)?,
            dbranch: cuda.alloc(512 * W)?,
            dhidden: cuda.alloc(512 * h)?,
            dgv: cuda.alloc(512 * 2 * h)?,
            dn1: cuda.alloc(512 * W)?,
            dx0: cuda.alloc(512 * W)?,
            dembed: cuda.alloc(512 * W)?,
            losses: cuda.alloc(512)?,
            hits: cuda.alloc(512)?,
            scratch: cuda.alloc(512 * 2 * h)?,
        })
    }
    // SAFETY: all kernels below operate on preallocated, disjoint buffers with validated
    // dimensions. In-place addition only reads/writes its own element. All launches use
    // the same CUDA context/stream; public entry points check the batch and dataset bounds.
    fn mm(&self, out: P, a: P, b: P, m: usize, n: usize, k: usize) -> Result<()> {
        let g = Grid::new(
            (m.div_ceil(gemm::kernels::BM) * n.div_ceil(gemm::kernels::BN)) as u32,
            gemm::kernels::THREADS as u32,
        );
        unsafe {
            if k.is_multiple_of(4) && n.is_multiple_of(4) {
                self.gemm
                    .sgemm::<true>(g, out, a, b, m as u32, n as u32, k as u32)?;
            } else {
                self.gemm
                    .sgemm::<false>(g, out, a, b, m as u32, n as u32, k as u32)?;
            }
        }
        Ok(())
    }
    fn transpose(&self, x: P, r: usize, c: usize) -> Result<()> {
        unsafe {
            self.ops
                .transpose(grid(r * c), self.scratch.ptr(), x, r as u32, c as u32)?;
        }
        Ok(())
    }
    fn linear(&self, y: P, x: P, off: usize, rows: usize, n: usize, k: usize) -> Result<()> {
        self.transpose(self.parameters.at(off), n, k)?;
        self.mm(y, x, self.scratch.ptr(), rows, n, k)
    }
    #[expect(
        clippy::too_many_arguments,
        reason = "explicit matrix shapes for Linear adjoint"
    )]
    fn linear_back(
        &self,
        dx: P,
        dy: P,
        x: P,
        off: usize,
        rows: usize,
        n: usize,
        k: usize,
    ) -> Result<()> {
        self.mm(dx, dy, self.parameters.at(off), rows, k, n)?;
        self.transpose(dy, rows, n)?;
        self.mm(self.gradients.at(off), self.scratch.ptr(), x, n, k, rows)
    }
    fn rms(&self, y: P, x: P, rows: usize) -> Result<()> {
        unsafe {
            self.ops.rms::<128>(rows_grid(rows), y, x, rows as u32)?;
        }
        Ok(())
    }
    fn rms_back(&self, dx: P, x: P, dy: P, rows: usize) -> Result<()> {
        unsafe {
            self.ops
                .rms_bwd::<128>(rows_grid(rows), dx, x, dy, rows as u32)?;
        }
        Ok(())
    }
    pub fn forward(
        &self,
        validation: bool,
        offset: usize,
        batch: usize,
        ordered: bool,
    ) -> Result<()> {
        let data = if validation {
            &self.validation
        } else {
            &self.train
        };
        let order = if ordered { &self.order } else { &self.identity };
        let bound = if ordered { order.len() } else { data.len() / 3 };
        if batch == 0
            || batch > 512
            || offset > bound
            || batch > bound - offset
            || (validation && ordered)
        {
            return Err("invalid batch range".into());
        }
        let (h, n) = (self.arm.hidden(), batch * W);
        unsafe {
            self.rotate.gather(
                grid(batch),
                self.tokens.ptr(),
                self.labels.ptr(),
                data.ptr(),
                order.at(offset),
                batch as u32,
            )?;
            self.rotate.embed(
                grid(n),
                self.embed.ptr(),
                self.parameters.ptr(),
                self.tokens.ptr(),
                n as u32,
            )?;
        }
        self.rms(self.x0.ptr(), self.embed.ptr(), batch)?;
        self.rms(self.n1.ptr(), self.x0.ptr(), batch)?;
        self.linear(self.gv.ptr(), self.n1.ptr(), E, batch, 2 * h, W)?;
        unsafe {
            match self.arm {
                Arm::Swiglu => self.ops.swiglu(
                    grid(batch * h),
                    self.hidden.ptr(),
                    self.gv.ptr(),
                    h as u32,
                    (batch * h) as u32,
                )?,
                Arm::Diagonal => self.product.product::<0>(
                    grid(batch * h / 2),
                    self.hidden.ptr(),
                    self.gv.ptr(),
                    (h / 2) as u32,
                    (batch * h / 2) as u32,
                )?,
                Arm::Product => self.product.product::<1>(
                    grid(batch * h / 2),
                    self.hidden.ptr(),
                    self.gv.ptr(),
                    (h / 2) as u32,
                    (batch * h / 2) as u32,
                )?,
                Arm::Plain => self.product.product::<2>(
                    grid(batch * h / 2),
                    self.hidden.ptr(),
                    self.gv.ptr(),
                    (h / 2) as u32,
                    (batch * h / 2) as u32,
                )?,
            }
        }
        self.linear(
            self.branch.ptr(),
            self.hidden.ptr(),
            E + 2 * h * W,
            batch,
            W,
            h,
        )?;
        self.rms(self.branch_norm.ptr(), self.branch.ptr(), batch)?;
        unsafe {
            self.ops.add(
                grid(n),
                self.x1.ptr(),
                self.x0.ptr(),
                self.branch_norm.ptr(),
                n as u32,
            )?;
        }
        self.rms(self.last.ptr(), self.x1.ptr(), batch)?;
        self.linear(self.logits.ptr(), self.last.ptr(), 0, batch, 97, W)?;
        unsafe {
            self.ops.loss(
                rows_grid(batch),
                self.dlogits.ptr(),
                self.losses.ptr(),
                self.hits.ptr(),
                self.logits.ptr(),
                self.labels.ptr(),
                batch as u32,
            )?;
        }
        Ok(())
    }
    /// Must immediately follow forward on the same batch, before parameters change.
    pub fn backward(&self, batch: usize) -> Result<()> {
        if batch == 0 || batch > 512 {
            return Err("invalid backward batch".into());
        }
        let h = self.arm.hidden();
        self.linear_back(
            self.dlast.ptr(),
            self.dlogits.ptr(),
            self.last.ptr(),
            0,
            batch,
            97,
            W,
        )?;
        self.rms_back(self.dx1.ptr(), self.x1.ptr(), self.dlast.ptr(), batch)?;
        self.rms_back(self.dbranch.ptr(), self.branch.ptr(), self.dx1.ptr(), batch)?;
        self.linear_back(
            self.dhidden.ptr(),
            self.dbranch.ptr(),
            self.hidden.ptr(),
            E + 2 * h * W,
            batch,
            W,
            h,
        )?;
        unsafe {
            match self.arm {
                Arm::Swiglu => self.ops.swiglu_bwd(
                    grid(batch * h),
                    self.dgv.ptr(),
                    self.gv.ptr(),
                    self.dhidden.ptr(),
                    h as u32,
                    (batch * h) as u32,
                )?,
                Arm::Diagonal => self.product.product_bwd::<0>(
                    grid(batch * h / 2),
                    self.dgv.ptr(),
                    self.gv.ptr(),
                    self.dhidden.ptr(),
                    (h / 2) as u32,
                    (batch * h / 2) as u32,
                )?,
                Arm::Product => self.product.product_bwd::<1>(
                    grid(batch * h / 2),
                    self.dgv.ptr(),
                    self.gv.ptr(),
                    self.dhidden.ptr(),
                    (h / 2) as u32,
                    (batch * h / 2) as u32,
                )?,
                Arm::Plain => self.product.product_bwd::<2>(
                    grid(batch * h / 2),
                    self.dgv.ptr(),
                    self.gv.ptr(),
                    self.dhidden.ptr(),
                    (h / 2) as u32,
                    (batch * h / 2) as u32,
                )?,
            }
        }
        self.linear_back(
            self.dn1.ptr(),
            self.dgv.ptr(),
            self.n1.ptr(),
            E,
            batch,
            2 * h,
            W,
        )?;
        self.rms_back(self.dx0.ptr(), self.x0.ptr(), self.dn1.ptr(), batch)?;
        unsafe {
            self.ops.add(
                grid(batch * W),
                self.dx0.ptr(),
                self.dx0.ptr(),
                self.dx1.ptr(),
                (batch * W) as u32,
            )?;
        }
        self.rms_back(self.dembed.ptr(), self.embed.ptr(), self.dx0.ptr(), batch)?;
        unsafe {
            self.rotate.embed_bwd(
                grid(E),
                self.gradients.ptr(),
                self.dembed.ptr(),
                self.tokens.ptr(),
                batch as u32,
            )?;
        }
        Ok(())
    }
    pub fn update(&self, step: usize) -> Result<()> {
        if step == 0 {
            return Err("AdamW updates are numbered from one".into());
        }
        let lr = 0.001 * (step as f64 / 10.0).min(1.0);
        let bc1 = (1.0 - 0.9f64.powf(step as f64)) as f32;
        let bc2 = (1.0 - 0.98f64.powf(step as f64)).sqrt() as f32;
        unsafe {
            if self.arm == Arm::Swiglu {
                self.ops.adamw(
                    grid(self.parameters.len()),
                    self.parameters.ptr(),
                    self.first.ptr(),
                    self.second.ptr(),
                    self.gradients.ptr(),
                    self.parameters.len() as u32,
                    lr as f32,
                    1.0,
                    bc1,
                    bc2,
                )?;
            } else {
                self.product.adamw::<false>(
                    grid(self.pairs.len() / 5),
                    self.parameters.ptr(),
                    self.first.ptr(),
                    self.second.ptr(),
                    self.gradients.ptr(),
                    self.pairs.ptr(),
                    (self.pairs.len() / 5) as u32,
                    lr as f32,
                    1.0,
                    bc1,
                    bc2,
                )?;
            }
        }
        Ok(())
    }
    pub fn metrics(&self, batch: usize) -> Result<Metrics> {
        if batch == 0 || batch > 512 {
            return Err("invalid metric batch".into());
        }
        let losses = self.losses.read()?;
        let hits = self.hits.read()?;
        if losses[..batch].iter().any(|x| !x.is_finite()) {
            return Err("nonfinite loss".into());
        }
        Ok(Metrics {
            loss: losses[..batch].iter().map(|&x| x as f64).sum::<f64>() / batch as f64,
            correct: hits[..batch].iter().map(|&x| x as usize).sum(),
            count: batch,
        })
    }
}
impl Backend for Engine {
    fn train_step(&self, offset: usize, batch: usize, step: usize) -> Result<()> {
        self.forward(false, offset, batch, true)?;
        self.backward(batch)?;
        self.update(step)
    }
    fn evaluate(&self, validation: bool) -> Result<Metrics> {
        let n = if validation { 4705 } else { 4704 };
        let mut result = Metrics {
            loss: 0.0,
            correct: 0,
            count: n,
        };
        for offset in (0..n).step_by(512) {
            let batch = (n - offset).min(512);
            self.forward(validation, offset, batch, false)?;
            let m = self.metrics(batch)?;
            result.loss += m.loss * batch as f64;
            result.correct += m.correct;
        }
        result.loss /= n as f64;
        Ok(result)
    }
    fn state(&self) -> Result<State> {
        Ok(State {
            parameters: self.parameters.read()?,
            first: self.first.read()?,
            second: self.second.read()?,
        })
    }
    fn restore(&mut self, state: &State) -> Result<()> {
        if !model::valid(self.arm, &state.parameters)
            || state.first.len() != self.parameters.len()
            || state.second.len() != self.parameters.len()
            || state
                .first
                .iter()
                .chain(&state.second)
                .any(|x| !x.is_finite())
            || state.second.iter().any(|&x| x < 0.0)
        {
            return Err("invalid checkpoint state".into());
        }
        self.parameters.write(&state.parameters)?;
        self.first.write(&state.first)?;
        self.second.write(&state.second)?;
        Ok(())
    }
}
