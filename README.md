# Grokking

An interactive course, in English, French and Russian, that works toward one statement:

> A neural network can learn a function with discontinuities of the second kind from an
> incomplete set of observations, if the function has a good spectrum.

The course makes every word of it precise:

- the function: a table on ℤ/p × ℤ/p, such as `ab mod p`;
- the observations: a random half of the table;
- the network: an embedding, a 90° rotation, Peri-LN with RMSNorm and a SwiGLU block, trained
  by Schedule-Free AdamW;
- a good spectrum: some readout of the answer turns the table into one with a strong
  singular direction.

It shows the hardest function the network learns and the simplest one it cannot. Every claim
carries its status: proved in Lean, proved by hand, measured, heuristic, or still open. The
Lean proofs live in the `transformer` repository (`Transformer.Grokking.FlatSpectrum`,
`Transformer.Weil`).

## Layout

| Directory | What it holds |
|---|---|
| `site/` | the course: TypeScript, no framework, hash routing, three languages |

Planned: `crates/` (Rust compiled to WebAssembly for the heavy computations of the pages)
and `experiments/` (training runs with PyTorch and uv, or Rust).

## Run it

Node 24.21 or later:

```sh
cd site
npm install
npm run build
npm start          # http://127.0.0.1:8090/
```

`npm test` builds and runs the tests; `npm run typecheck` checks the sources and the tests.

The site is previewed locally only.
