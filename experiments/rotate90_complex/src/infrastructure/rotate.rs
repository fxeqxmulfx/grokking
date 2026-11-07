//! Rotate90 lookup and its exact tied-embedding adjoint, without atomics.
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
    pub unsafe extern "ptx-kernel" fn gather(
        tokens: *mut u32,
        labels: *mut u32,
        data: *const u32,
        order: *const u32,
        batch: u32,
    ) {
        let (b, row, at, a, c, label): (u32, u32, u32, u32, u32, u32);
        index(b);
        let past: pred;
        setp.ge.u32(past, b, batch);
        if past {
            ret();
        }
        load_u(row, order, b);
        mul.lo.u32(at, row, 3);
        load_u(a, data, at);
        add.u32(at, at, 1);
        load_u(c, data, at);
        add.u32(at, at, 1);
        load_u(label, data, at);
        mul.lo.u32(at, b, 2);
        store_u(tokens, at, a);
        add.u32(at, at, 1);
        store_u(tokens, at, c);
        store_u(labels, b, label);
    }
    pub unsafe extern "ptx-kernel" fn embed(
        y: *mut f32,
        p: *const f32,
        tokens: *const u32,
        count: u32,
    ) {
        let (i, row, col, a, b, at, mate, odd): (u32, u32, u32, u32, u32, u32, u32, u32);
        index(i);
        let past: pred;
        setp.ge.u32(past, i, count);
        if past {
            ret();
        }
        div.u32(row, i, 128);
        rem.u32(col, i, 128);
        mul.lo.u32(at, row, 2);
        load_u(a, tokens, at);
        add.u32(at, at, 1);
        load_u(b, tokens, at);
        mad.lo.u32(at, a, 128, col);
        let (u, v): (f32, f32);
        load(u, p, at);
        xor.b32(mate, col, 1);
        mad.lo.u32(at, b, 128, mate);
        load(v, p, at);
        and.b32(odd, col, 1);
        setp.eq.u32(past, odd, 0);
        if past {
            neg.f32(v, v);
        }
        add.rn.f32(u, u, v);
        store(y, i, u);
    }
    /// Add both operand paths to the readout gradient, including when a=b.
    pub unsafe extern "ptx-kernel" fn embed_bwd(
        g: *mut f32,
        dx: *const f32,
        tokens: *const u32,
        batch: u32,
    ) {
        let (i, word, col, row, a, b, at, mate, odd): (
            u32,
            u32,
            u32,
            u32,
            u32,
            u32,
            u32,
            u32,
            u32,
        );
        index(i);
        let yes: pred;
        setp.ge.u32(yes, i, 12416);
        if yes {
            ret();
        }
        div.u32(word, i, 128);
        rem.u32(col, i, 128);
        xor.b32(mate, col, 1);
        and.b32(odd, col, 1);
        let (total, value): (f32, f32);
        load(total, g, i);
        mov.u32(row, 0);
        label(iteration);
        mul.lo.u32(at, row, 2);
        load_u(a, tokens, at);
        add.u32(at, at, 1);
        load_u(b, tokens, at);
        setp.eq.u32(yes, a, word);
        if yes {
            mad.lo.u32(at, row, 128, col);
            load(value, dx, at);
            add.rn.f32(total, total, value);
        }
        setp.ne.u32(yes, b, word);
        if yes {
            bra(skip_b);
        }
        mad.lo.u32(at, row, 128, mate);
        load(value, dx, at);
        setp.ne.u32(yes, odd, 0);
        if yes {
            neg.f32(value, value);
        }
        add.rn.f32(total, total, value);
        label(skip_b);
        add.u32(row, row, 1);
        setp.lt.u32(yes, row, batch);
        if yes {
            bra(iteration);
        }
        store(g, i, total);
    }
}
