//! GPU operations for the Rotate90 experiment; ported from GPT 786696b. FP32 activations and parameters;
//! RMS derivatives keep the original separated FP64 radial/tangent calculation.

#[kernite_macros::kernels]
pub mod kernels {
    fn load(x: f32, base: u64, i: u32) {
        let p: u64;
        mad.wide.u32(p, i, 4, base);
        ld.global.f32(x, [p]);
    }
    fn store(base: u64, i: u32, x: f32) {
        let p: u64;
        mad.wide.u32(p, i, 4, base);
        st.global.f32([p], x);
    }
    fn load_u(x: u32, base: u64, i: u32) {
        let p: u64;
        mad.wide.u32(p, i, 4, base);
        ld.global.u32(x, [p]);
    }
    fn store_u(base: u64, i: u32, x: u32) {
        let p: u64;
        mad.wide.u32(p, i, 4, base);
        st.global.u32([p], x);
    }
    fn index(i: u32) {
        let (b, t, n): (u32, u32, u32);
        mov.u32(b, ctaid.x);
        mov.u32(t, tid.x);
        mov.u32(n, ntid.x);
        mad.lo.u32(i, b, n, t);
    }
    fn sum32(x: f32) {
        let v: f32;
        for j in 0..5 {
            shfl.sync.bfly.b32(v, x, 1 << j, 31, 0xffffffff);
            add.rn.f32(x, x, v);
        }
    }
    fn sum64(x: f64) {
        let (lo, hi, other_lo, other_hi): (u32, u32, u32, u32);
        let v: f64;
        for j in 0..5 {
            mov.b64((lo, hi), x);
            shfl.sync.bfly.b32(other_lo, lo, 1 << j, 31, 0xffffffff);
            shfl.sync.bfly.b32(other_hi, hi, 1 << j, 31, 0xffffffff);
            mov.b64(v, (other_lo, other_hi));
            add.rn.f64(x, x, v);
        }
    }
    fn exp(x: f32) {
        mul.rn.f32(x, x, 1.4426950408889634);
        ex2.approx.f32(x, x);
    }

    pub unsafe extern "ptx-kernel" fn transpose(y: *mut f32, x: *const f32, rows: u32, cols: u32) {
        let (i, n, r, c, j): (u32, u32, u32, u32, u32);
        index(i);
        mul.lo.u32(n, rows, cols);
        let past: pred;
        setp.ge.u32(past, i, n);
        if past {
            ret();
        }
        div.u32(r, i, cols);
        rem.u32(c, i, cols);
        mad.lo.u32(j, c, rows, r);
        let v: f32;
        load(v, x, i);
        store(y, j, v);
    }

    /// Each warp normalizes one row; epsilon is FP32 machine epsilon.
    #[instances(128, 256)]
    pub unsafe extern "ptx-kernel" fn rms<const W: usize>(y: *mut f32, x: *const f32, rows: u32) {
        let (i, row, lane, at): (u32, u32, u32, u32);
        index(i);
        shr.u32(row, i, 5);
        and.b32(lane, i, 31);
        let past: pred;
        setp.ge.u32(past, row, rows);
        if past {
            ret();
        }
        mad.lo.u32(at, row, W, lane);
        let v: [f32; W / 32];
        let (s, z): (f32, f32);
        mov.f32(s, 0.0);
        for j in 0..W / 32 {
            load(v[j], x, at);
            mul.rn.f32(z, v[j], v[j]);
            add.rn.f32(s, s, z);
            add.u32(at, at, 32);
        }
        sum32(s);
        mul.rn.f32(s, s, 1.0 / (W as f32));
        add.rn.f32(s, s, 0.00000011920928955078125);
        rsqrt.approx.f32(s, s);
        mad.lo.u32(at, row, W, lane);
        for j in 0..W / 32 {
            mul.rn.f32(z, v[j], s);
            store(y, at, z);
            add.u32(at, at, 32);
        }
    }

    /// The separated radial/tangent RMS backward, using FP64 before the final cast.
    #[instances(128, 256)]
    pub unsafe extern "ptx-kernel" fn rms_bwd<const W: usize>(
        dx: *mut f32,
        x: *const f32,
        dy: *const f32,
        rows: u32,
    ) {
        let (i, row, lane, at): (u32, u32, u32, u32);
        index(i);
        shr.u32(row, i, 5);
        and.b32(lane, i, 31);
        let past: pred;
        setp.ge.u32(past, row, rows);
        if past {
            ret();
        }
        mad.lo.u32(at, row, W, lane);
        let (v, g): ([f64; W / 32], [f64; W / 32]);
        let (energy, dot, temp): (f64, f64, f64);
        let z: f32;
        mov.f64(energy, 0.0f64);
        mov.f64(dot, 0.0f64);
        for j in 0..W / 32 {
            load(z, x, at);
            cvt.f64.f32(v[j], z);
            load(z, dy, at);
            cvt.f64.f32(g[j], z);
            mul.rn.f64(temp, v[j], v[j]);
            add.rn.f64(energy, energy, temp);
            mul.rn.f64(temp, v[j], g[j]);
            add.rn.f64(dot, dot, temp);
            add.u32(at, at, 32);
        }
        sum64(energy);
        sum64(dot);
        mul.rn.f64(energy, energy, 1.0f64 / (W as f64));
        mul.rn.f64(dot, dot, 1.0f64 / (W as f64));
        let (den, inv, radial, parallel, tangent): (f64, f64, f64, f64, f64);
        let positive: pred;
        setp.gt.f64(positive, energy, 0.0f64);
        selp.f64(den, energy, 1.0f64, positive);
        add.rn.f64(inv, energy, 0.00000011920928955078125f64);
        sqrt.rn.f64(inv, inv);
        div.rn.f64(inv, 1.0f64, inv);
        mul.rn.f64(radial, inv, inv);
        mul.rn.f64(radial, radial, inv);
        mul.rn.f64(radial, radial, 0.00000011920928955078125f64);
        mad.lo.u32(at, row, W, lane);
        for j in 0..W / 32 {
            mul.rn.f64(parallel, v[j], dot);
            div.rn.f64(parallel, parallel, den);
            sub.rn.f64(tangent, g[j], parallel);
            mul.rn.f64(tangent, tangent, inv);
            mul.rn.f64(parallel, parallel, radial);
            add.rn.f64(tangent, tangent, parallel);
            cvt.rn.f32.f64(z, tangent);
            store(dx, at, z);
            add.u32(at, at, 32);
        }
    }

    /// Fused SwiGLU, with the frozen gate/value column layout.
    pub unsafe extern "ptx-kernel" fn swiglu(y: *mut f32, x: *const f32, hidden: u32, count: u32) {
        let (i, row, col, at): (u32, u32, u32, u32);
        index(i);
        let past: pred;
        setp.ge.u32(past, i, count);
        if past {
            ret();
        }
        div.u32(row, i, hidden);
        rem.u32(col, i, hidden);
        mul.lo.u32(row, row, 2);
        mad.lo.u32(at, row, hidden, col);
        let (gate, value, s): (f32, f32, f32);
        load(gate, x, at);
        add.u32(at, at, hidden);
        load(value, x, at);
        neg.f32(s, gate);
        exp(s);
        add.rn.f32(s, s, 1.0);
        div.rn.f32(s, 1.0, s);
        mul.rn.f32(s, gate, s);
        mul.rn.f32(s, s, value);
        store(y, i, s);
    }

    pub unsafe extern "ptx-kernel" fn swiglu_bwd(
        dx: *mut f32,
        x: *const f32,
        dy: *const f32,
        hidden: u32,
        count: u32,
    ) {
        let (i, row, col, at, next): (u32, u32, u32, u32, u32);
        index(i);
        let past: pred;
        setp.ge.u32(past, i, count);
        if past {
            ret();
        }
        div.u32(row, i, hidden);
        rem.u32(col, i, hidden);
        mul.lo.u32(row, row, 2);
        mad.lo.u32(at, row, hidden, col);
        add.u32(next, at, hidden);
        let (gate, value, s, g, t, dg, dv): (f32, f32, f32, f32, f32, f32, f32);
        load(gate, x, at);
        load(value, x, next);
        load(g, dy, i);
        neg.f32(s, gate);
        exp(s);
        add.rn.f32(s, s, 1.0);
        div.rn.f32(s, 1.0, s);
        mul.rn.f32(dv, gate, s);
        mul.rn.f32(dv, dv, g);
        sub.rn.f32(t, 1.0, s);
        mul.rn.f32(t, t, gate);
        add.rn.f32(t, t, 1.0);
        mul.rn.f32(t, t, s);
        mul.rn.f32(dg, g, value);
        mul.rn.f32(dg, dg, t);
        store(dx, at, dg);
        store(dx, next, dv);
    }

    pub unsafe extern "ptx-kernel" fn add(out: *mut f32, a: *const f32, b: *const f32, count: u32) {
        let i: u32;
        index(i);
        let past: pred;
        setp.ge.u32(past, i, count);
        if past {
            ret();
        }
        let (x, y): (f32, f32);
        load(x, a, i);
        load(y, b, i);
        add.rn.f32(x, x, y);
        store(out, i, x);
    }

    /// All 97 classes for one Rotate90 state. One warp per example.
    pub unsafe extern "ptx-kernel" fn loss(
        dlogits: *mut f32,
        losses: *mut f32,
        hits: *mut u32,
        logits: *const f32,
        targets: *const u32,
        batch: u32,
    ) {
        let (i, b, lane, at, target): (u32, u32, u32, u32, u32);
        index(i);
        shr.u32(b, i, 5);
        and.b32(lane, i, 31);
        let past: pred;
        setp.ge.u32(past, b, batch);
        if past {
            ret();
        }
        load_u(target, targets, b);
        let (v, p): ([f32; 4], [f32; 4]);
        let (max, peer, total, chosen, n): (f32, f32, f32, f32, f32);
        mov.f32(max, f32::NEG_INFINITY);
        mov.f32(chosen, 0.0);
        let (cls, best, candidate): (u32, u32, u32);
        mov.u32(best, 0xffffffff);
        for j in 0..4 {
            add.u32(cls, lane, 32 * j);
            mov.f32(v[j], f32::NEG_INFINITY);
            setp.lt.u32(past, cls, 97);
            if past {
                mad.lo.u32(at, b, 97, cls);
                load(v[j], logits, at);
            }
            max.f32(max, max, v[j]);
        }
        for j in 0..5 {
            shfl.sync.bfly.b32(peer, max, 1 << j, 31, 0xffffffff);
            max.f32(max, max, peer);
        }
        mov.f32(total, 0.0);
        for j in 0..4 {
            sub.rn.f32(p[j], v[j], max);
            exp(p[j]);
            add.rn.f32(total, total, p[j]);
            add.u32(cls, lane, 32 * j);
            setp.eq.u32(past, cls, target);
            if past {
                mov.f32(chosen, v[j]);
            }
            setp.eq.f32(past, v[j], max);
            if past {
                min.u32(best, best, cls);
            }
        }
        sum32(total);
        sum32(chosen);
        for j in 0..5 {
            shfl.sync.bfly.b32(candidate, best, 1 << j, 31, 0xffffffff);
            min.u32(best, best, candidate);
        }
        cvt.rn.f32.u32(n, batch);
        for j in 0..4 {
            add.u32(cls, lane, 32 * j);
            setp.lt.u32(past, cls, 97);
            if past {
                div.rn.f32(p[j], p[j], total);
                let label: f32;
                let is_target: pred;
                setp.eq.u32(is_target, cls, target);
                selp.f32(label, 1.0, 0.0, is_target);
                sub.rn.f32(p[j], p[j], label);
                div.rn.f32(p[j], p[j], n);
                mad.lo.u32(at, b, 97, cls);
                store(dlogits, at, p[j]);
            }
        }
        setp.eq.u32(past, lane, 0);
        if past {
            lg2.approx.f32(total, total);
            mul.rn.f32(total, total, 0.6931471805599453);
            sub.rn.f32(chosen, max, chosen);
            add.rn.f32(total, total, chosen);
            store(losses, b, total);
            let hit: pred;
            setp.eq.u32(hit, best, target);
            selp.u32(best, 1, 0, hit);
            store_u(hits, b, best);
        }
    }

    /// Native AdamW: all parameters, including the tied embedding, updated once.
    pub unsafe extern "ptx-kernel" fn adamw(
        p: *mut f32,
        m: *mut f32,
        v: *mut f32,
        g: *const f32,
        count: u32,
        lr: f32,
        decay: f32,
        bc1: f32,
        bc2root: f32,
    ) {
        let i: u32;
        index(i);
        let past: pred;
        setp.ge.u32(past, i, count);
        if past {
            ret();
        }
        let (pi, mi, vi, gi, z, s): (f32, f32, f32, f32, f32, f32);
        load(pi, p, i);
        load(mi, m, i);
        load(vi, v, i);
        load(gi, g, i);
        sub.rn.f32(z, gi, mi);
        fma.rn.f32(mi, 0.1, z, mi);
        mul.rn.f32(z, gi, gi);
        mul.rn.f32(vi, vi, 0.98);
        fma.rn.f32(vi, 0.02, z, vi);
        store(m, i, mi);
        store(v, i, vi);
        sqrt.rn.f32(z, vi);
        div.rn.f32(z, z, bc2root);
        add.rn.f32(z, z, 1e-8);
        div.rn.f32(s, lr, bc1);
        mul.rn.f32(mi, mi, s);
        div.rn.f32(mi, mi, z);
        mul.rn.f32(s, lr, decay);
        sub.rn.f32(s, 1.0, s);
        mul.rn.f32(pi, pi, s);
        sub.rn.f32(pi, pi, mi);
        store(p, i, pi);
    }
}
