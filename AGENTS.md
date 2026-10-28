# AGENTS.md

An interactive course on what a network learns from half a table, in English, French and
Russian, for students who know analysis up to complex analysis. `README.md` states the goal.
Its mathematics is proved in Lean in `~/lean_projects/transformer`.

## Always

- English in code, comments, filenames and commits; the pages in all three languages.
- One commit per logical change, as soon as its checks pass.
- Preview locally (`npm start` in `site/`). Never publish a page as an artifact or on the web.
- A claim on a page carries its status: `lean` (name declarations that exist in the
  transformer repository's `INDEX.md`), `hand`, `numerical`, `heuristic` or `open`. Only a
  Lean proof makes a claim proved.
- When a page needs a result that is not proved, prove it in Lean in the transformer
  repository, under that repository's rules, then deliver it to the page.

## Site (`site/`)

- TypeScript only, no framework, no runtime dependencies. Sources import each other with
  `.ts` extensions; `tsc` rewrites them.
- One kernel: a pure `update(state, message)` in `src/app/update.ts` owns the state. Views
  subscribe to the kernel and render from the state; controls only send messages
  (`data-send`, `data-send-value`). The state lives only in the kernel; a view may remember
  what it last drew, to skip redrawing it.
- Hash routing: `#/<lang>/<page>[/<section>]`.
- A page is data in `src/pages/<id>/`: `spec.ts` holds what does not depend on the language
  (quiz answers, status kinds, Lean names); `en.ts`, `fr.ts`, `ru.ts` hold the texts under one
  interface, so a missing text does not compile. The tests check that the three languages
  have the same sections, widgets, quizzes, answers and status cards.
- `npm run typecheck` and `npm test` pass before every commit. Look at a changed page in a
  browser, at desktop and at phone width, before committing it. With `npm start` running,
  `npm run overflow` lists every formula and tag that leaves its column at 360 px.

## Computation

- Heavy computation runs in Rust compiled to `wasm32-unknown-unknown`, with a raw
  `extern "C"` interface and no `wasm-bindgen`; a small TypeScript module loads it.
- Code other than the frontend follows clean architecture: domain → application →
  infrastructure → interfaces, each layer importing only its own or earlier ones;
  third-party packages only in the last two.
- Experiments use PyTorch with uv (`uv run --locked` inside the experiment's project) or
  Rust.
