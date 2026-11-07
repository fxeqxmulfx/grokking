//! The real course block and equally parameterized complex block replacements.
//! Every arm has 143360 independent real parameters. E uses adjacent complex pairs;
//! hidden complex vectors use real/imaginary planes, each of length 341.
use super::data::Random;
pub const W: usize = 128;
pub const H: usize = 341;
pub const E: usize = 97 * W;
pub const STEPS: usize = 10000;
pub const UPDATES_PER_EPOCH: usize = 10;
pub const SAVE_EVERY: usize = 500 * UPDATES_PER_EPOCH;
pub const REPORT_EVERY: usize = 100;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Arm {
    Swiglu,
    Diagonal,
    Product,
    Plain,
}
impl Arm {
    pub const ALL: [Self; 4] = [Self::Swiglu, Self::Diagonal, Self::Product, Self::Plain];
    pub fn name(self) -> &'static str {
        match self {
            Self::Swiglu => "real-swiglu",
            Self::Diagonal => "complex-diagonal",
            Self::Product => "complex-product-radial",
            Self::Plain => "complex-product-plain",
        }
    }
    pub fn hidden(self) -> usize {
        if self == Self::Swiglu { H } else { 2 * H }
    }
    pub fn count(self) -> usize {
        E + 3 * W * self.hidden()
    }
}

/// [A, B, -B, A, kind] storage owners, in the output-major real expansion.
/// Embedding owners have kind 1 and update the two coordinates independently.
pub fn pairs() -> Vec<[u32; 5]> {
    let mut map = Vec::new();
    for word in 0..97 {
        for c in 0..W / 2 {
            let at = word * W + 2 * c;
            map.push([at as u32, (at + 1) as u32, 0, 0, 1]);
        }
    }
    for branch in 0..2 {
        for r in 0..H {
            for c in 0..W / 2 {
                let ar = E + (branch * 2 * H + r) * W + 2 * c;
                map.push([
                    ar as u32,
                    (ar + H * W) as u32,
                    (ar + 1) as u32,
                    (ar + H * W + 1) as u32,
                    0,
                ]);
            }
        }
    }
    let offset = E + 4 * H * W;
    for r in 0..W / 2 {
        for c in 0..H {
            let ar = offset + 2 * r * 2 * H + c;
            map.push([
                ar as u32,
                (ar + 2 * H) as u32,
                (ar + H) as u32,
                (ar + 3 * H) as u32,
                0,
            ]);
        }
    }
    map
}

pub fn initialize(arm: Arm, seed: u64) -> Vec<f32> {
    let mut rng = Random(seed ^ 0x73696d706c650004);
    let mut p = vec![0.0; arm.count()];
    let bound = 1.0 / 97.0f32.sqrt();
    for value in &mut p[..E] {
        *value = (2.0 * rng.unit() as f32 - 1.0) * bound;
    }
    if arm == Arm::Swiglu {
        // Match the course's input-major RNG stream, then transpose for GPU GEMM.
        let gv = rng.normals(W * 2 * H, 0.02);
        for c in 0..W {
            for r in 0..2 * H {
                p[E + r * W + c] = gv[c * 2 * H + r];
            }
        }
        let out = rng.normals(H * W, 0.02 / 2.0f64.sqrt());
        for c in 0..H {
            for r in 0..W {
                p[E + 2 * H * W + r * H + c] = out[c * W + r];
            }
        }
    } else {
        // Each independent A/B coordinate has the course's component variance.
        // All complex arms receive identical initial parameters.
        let gv = rng.normals(2 * W * H, 0.02);
        let out = rng.normals(W * H, 0.02 / 2.0f64.sqrt());
        let mut values = gv.into_iter().chain(out);
        for [ar, bi, br, ai, kind] in pairs() {
            if kind == 1 {
                continue;
            }
            let a = values.next().unwrap();
            let b = values.next().unwrap();
            p[ar as usize] = a;
            p[ai as usize] = a;
            p[bi as usize] = b;
            p[br as usize] = -b;
        }
        assert!(values.next().is_none());
    }
    p
}

pub fn valid(arm: Arm, p: &[f32]) -> bool {
    p.len() == arm.count()
        && p.iter().all(|x| x.is_finite())
        && (arm == Arm::Swiglu
            || pairs().iter().all(|&[ar, bi, br, ai, kind]| {
                kind == 1 || (p[ar as usize] == p[ai as usize] && p[bi as usize] == -p[br as usize])
            }))
}
