# Experiments

Python experiments are uv projects; run them with `uv run --locked …` inside their directories.
Rust experiments document their Cargo commands in their own README.

| experiment | question |
| --- | --- |
| [`recovery/`](recovery/) | When does model M, the least nuclear norm that agrees with a table on the kept cells, give the table back? Every pattern of small tables against Theorems E, F and G, and the failure margin on 3 × 3 to 7 × 7; ψ(a + b), ψ(a³ + ab) and characters on prime tables, from diagonals, random cells and the training halves, against Theorem D; above rank one, 2 × 2 tables from three cells and random tables of rank 2 and 3 against the rank-r certificate and the necessary condition, and tables of rank 2 to 8, full column rank among them, against the dual criterion for a minimum, read off the solver's dual. |
| [`training/`](training/) | Does the course's network (Rotate90 with SwiGLU and Peri-RMSNorm) learn `f(a, b) mod 97` from half its table, and does the peak κ of the table predict which tasks it learns? 13 tasks, seeds 7 and 11, AdamW and Schedule-Free AdamW; κ of 25 tasks at p = 47, 97, 199. |
| [`rotate90_complex/`](rotate90_complex/) | Does replacing Rotate90's SwiGLU with a complex product help on `(a+b)^3 mod 97`? Native Rust/Kernite; equal parameter budgets, AdamW, seeds 7 and 11, 10000 updates; real SwiGLU, complex diagonal control, radial and plain complex products. |
