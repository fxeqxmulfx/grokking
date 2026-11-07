//! SplitMix64, split and sampler ported from training/domain at grokking a3eb468.
//! Raw residues only: no intermediate sum or Fourier features enter the network.

pub struct Random(pub u64);
impl Random {
    pub fn next(&mut self) -> u64 {
        self.0 = self.0.wrapping_add(0x9e3779b97f4a7c15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xbf58476d1ce4e5b9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94d049bb133111eb);
        z ^ (z >> 31)
    }
    pub fn unit(&mut self) -> f64 {
        (self.next() >> 40) as f64 / 16777216.0
    }
    pub fn shuffle<T>(&mut self, values: &mut [T]) {
        for end in (1..values.len()).rev() {
            let bound = (end + 1) as u64;
            let threshold = bound.wrapping_neg() % bound;
            let j = loop {
                let value = self.next();
                if value >= threshold {
                    break (value % bound) as usize;
                }
            };
            values.swap(end, j);
        }
    }
    pub fn normals(&mut self, count: usize, deviation: f64) -> Vec<f32> {
        let mut out = Vec::with_capacity(count + 1);
        while out.len() < count {
            let radius = (-2.0 * (1.0 - self.unit()).ln()).sqrt();
            let angle = std::f64::consts::TAU * self.unit();
            out.push((deviation * radius * angle.cos()) as f32);
            out.push((deviation * radius * angle.sin()) as f32);
        }
        out.truncate(count);
        out
    }
}

pub struct Data {
    pub train: Vec<u32>,
    pub validation: Vec<u32>,
}
impl Data {
    pub fn new(seed: u64) -> Self {
        let mut rows: Vec<[u32; 3]> = (0u32..97)
            .flat_map(|a| (0u32..97).map(move |b| [a, b, (a + b).pow(3) % 97]))
            .collect();
        Random(seed ^ 0x73706c6974730002).shuffle(&mut rows);
        Self {
            train: rows[..4704].iter().flatten().copied().collect(),
            validation: rows[4704..].iter().flatten().copied().collect(),
        }
    }
}

pub struct Plan {
    pub order: Vec<u32>,
    pub boundaries: Vec<usize>,
}
impl Plan {
    pub fn new(seed: u64, steps: usize) -> Self {
        let mut rng = Random(seed ^ 0x6261746368657303);
        let mut epoch: Vec<u32> = (0..4704).collect();
        rng.shuffle(&mut epoch);
        let mut position = 0;
        let mut order = Vec::with_capacity(steps * 512);
        let mut boundaries = vec![0];
        for _ in 0..steps {
            if position == epoch.len() {
                rng.shuffle(&mut epoch);
                position = 0;
            }
            let end = (position + 512).min(epoch.len());
            order.extend_from_slice(&epoch[position..end]);
            boundaries.push(order.len());
            position = end;
        }
        Self { order, boundaries }
    }
}
