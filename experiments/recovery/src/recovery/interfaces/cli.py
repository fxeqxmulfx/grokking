"""The checks from the command line: `uv run --locked recovery <check> …` inside this project."""

import argparse
import math

from recovery.application.summary import ClassSummary, merge
from recovery.application.sweeps import G_CLASSES, Table, equal_weights, slow_tight_hall, sweep, zero_tables
from recovery.application.weights import cross_check, slow_tight_weights, tight_tables, weighted_tables
from recovery.application.additive import Filled, cubic_splits, diagonal_certificate, long_diagonals, long_runs, survey, theorem_d
from recovery.application.characters import character_check
from recovery.infrastructure.admm import TorchADMM
from recovery.infrastructure.certificates import TorchCertificates
from recovery.infrastructure.draws import TorchDraws


def line(s: ClassSummary) -> str:
    return (f"  {s.name:24s} patterns={s.count:6d} recovered={s.recovered:6d}"
            f" gap in [{s.gap[0]:+.2e}, {s.gap[1]:+.2e}] error in [{s.error[0]:.2e}, {s.error[1]:.2e}]")


def stopped(f: Filled) -> str:
    return f"steps={f.steps:6d} residuals={f.residuals[0]:.1e}/{f.residuals[1]:.1e}"


def weighted_sweep(solver: TorchADMM, tables: list[Table], steps: int) -> None:
    for table in tables:
        print(f"{table.name}: |a| = {[round(abs(x), 3) for x in table.a]}, |b| = {[round(abs(x), 3) for x in table.b]}")
        for s in sweep(solver, table.groups, table.a, table.b, steps, lambda c: c.error_of_hidden):
            print(line(s), flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(prog="recovery", description=__doc__)
    parser.add_argument("--device", help="cpu (the default) or cuda")
    checks = parser.add_subparsers(dest="check", required=True)
    equal = checks.add_parser("equal", help="Theorem E: every pattern of a square table of ones")
    equal.add_argument("size", type=int)
    equal.add_argument("steps", type=int)
    weighted = checks.add_parser("weighted", help="Theorem F: every pattern, random a bᵀ without zeros")
    weighted.add_argument("size", type=int)
    weighted.add_argument("steps", type=int)
    weighted.add_argument("--draws", type=int, default=3)
    weighted.add_argument("--seed", type=int, default=0)
    tight = checks.add_parser("tight", help="Theorem F: every pattern, three 3 x 3 tables with exact ties")
    tight.add_argument("steps", type=int)
    tight.add_argument("--seed", type=int, default=1)
    tight_slow = checks.add_parser("tight-slow", help="the rigid patterns with a plan of tight table A, run longer")
    tight_slow.add_argument("checkpoints", type=int, nargs="+")
    tight_slow.add_argument("--seed", type=int, default=1)
    cross = checks.add_parser("cross", help="Theorem F, item 4: the cross of row 0 and column 0, random a bᵀ")
    cross.add_argument("steps", type=int)
    cross.add_argument("--count", type=int, default=400, help="tables of each size")
    cross.add_argument("--sizes", type=int, nargs="+", default=[3, 4, 5, 6])
    cross.add_argument("--seed", type=int, default=0)
    zeros = checks.add_parser("zeros", help="Theorem G: every pattern of tables with zero entries")
    zeros.add_argument("steps", type=int)
    zeros.add_argument("--seed", type=int, default=0)
    zeros.add_argument("--tight", action="store_true", help="moduli with exact ties instead of generic ones")
    slow = checks.add_parser("slow", help="rigid patterns of ones with a tight Hall condition, run longer")
    slow.add_argument("size", type=int)
    slow.add_argument("checkpoints", type=int, nargs="+")
    primes = checks.add_parser("theorem-d", help="Theorem D: psi(a + b) and psi(a^3 + ab) from eight patterns")
    primes.add_argument("primes", type=int, nargs="+")
    primes.add_argument("--cap", type=int, default=20000)
    diagonal = checks.add_parser("diagonals", help="Theorem D, items 3, 5, 6: diagonals of larger tables")
    diagonal.add_argument("primes", type=int, nargs="+")
    diagonal.add_argument("--cap", type=int, default=200000)
    surveyed = checks.add_parser("survey", help="psi(a + b) from random patterns and the training splits")
    surveyed.add_argument("primes", type=int, nargs="+")
    surveyed.add_argument("--cap", type=int, default=20000)
    surveyed.add_argument("--best-steps", type=int, default=6000)
    long = checks.add_parser("long", help="the survey patterns between Theorems D and E, run longer")
    long.add_argument("prime", type=int)
    long.add_argument("checkpoints", type=int, nargs="+")
    cubic = checks.add_parser("cubic", help="psi(a^3 + ab) from the training splits")
    cubic.add_argument("primes", type=int, nargs="+")
    cubic.add_argument("--cap", type=int, default=20000)
    chars = checks.add_parser("characters", help="Theorem G: chi(ab) and chi(a + ab) from the training splits")
    chars.add_argument("primes", type=int, nargs="+")
    chars.add_argument("--cap", type=int, default=20000)
    args = parser.parse_args()
    solver = TorchADMM(args.device)
    print(f"device {solver.device}", flush=True)
    match args.check:
        case "equal":
            print(f"{args.size} x {args.size}, J, {args.steps} steps")
            for s in equal_weights(solver, args.size, args.steps):
                print(line(s), flush=True)
        case "weighted":
            weighted_sweep(solver, weighted_tables(TorchDraws(args.seed), args.size, args.draws), args.steps)
        case "tight":
            weighted_sweep(solver, tight_tables(TorchDraws(args.seed)), args.steps)
        case "tight-slow":
            for stop, s, worst in slow_tight_weights(solver, TorchDraws(args.seed), args.checkpoints):
                cells = [(i, j) for i, row in enumerate(worst) for j, kept in enumerate(row) if kept]
                print(f"after {stop:7d} steps:", line(s).strip(), "largest error at", cells, flush=True)
        case "cross":
            bins: dict[str, list[ClassSummary]] = {}
            for size, summaries in cross_check(solver, TorchDraws(args.seed), args.sizes, args.count, args.steps):
                print(f"{size} x {size}, {args.count} tables, {args.steps} steps")
                for s in summaries:
                    bins.setdefault(s.name, []).append(s)
                    print(line(s), flush=True)
            print("all sizes")
            for name, parts in bins.items():
                print(line(merge(name, parts)))
        case "theorem-d":
            for p in args.primes:
                lean = math.sqrt(1 - 1 / (4 * p * p))
                y = diagonal_certificate(TorchCertificates(), p, [0, 1])
                print(f"p = {p}: diagonals {{0,1}}: ||Y - J/p||_op = {y:.6f}, cos(pi/p) = {math.cos(math.pi / p):.6f},"
                      f" proved bound sqrt(1 - 1/(4p^2)) = {lean:.6f}")
                for task, name, f, norm in theorem_d(solver, TorchDraws, p, args.cap):
                    print(f"  {task:7s} {name:27s} cells={f.cells:5d} error={f.error:.2e} ||X||_S1={f.nuclear:9.4f}"
                          f" ||K||_S1={norm:9.4f} {stopped(f)}", flush=True)
        case "diagonals":
            for p in args.primes:
                lean = math.sqrt(1 - 1 / (4 * p * p))
                for name, y, f in long_diagonals(solver, TorchCertificates(), p, args.cap):
                    certificate = (f"||Y - J/p||_op = {y:.6f} (cos(pi/p) = {math.cos(math.pi / p):.6f}, proved bound"
                                   f" {lean:.6f})" if y is not None else f"||X|| off the pattern = {f.hidden:.1e}")
                    print(f"p = {p} {name}: {certificate} error={f.error:.2e} ||X||_S1={f.nuclear:.4f} {stopped(f)}", flush=True)
        case "survey":
            for p in args.primes:
                for r in survey(solver, TorchCertificates(), TorchDraws, p, args.cap, args.best_steps):
                    certificate = "none" if r.certificate is None else f"{r.certificate:.4f}"
                    best = "-" if r.best is None else f"{r.best[0]:.4f} (constraints {r.best[1]:.0e})"
                    print(f"p = {p:3d} {r.name:27s} cells={r.fill.cells:5d} rigid={int(r.rigid)} matching={r.matching:3d}"
                          f" elementary={int(r.elementary)} block bound={r.block_bound:.4f} leaves={r.leaves[0]}/{r.leaves[1]}"
                          f" certificate={certificate} best={best} error={r.fill.error:.2e} ||X||_S1={r.fill.nuclear:8.3f}"
                          f" {stopped(r.fill)}", flush=True)
        case "long":
            for name, f in long_runs(solver, TorchDraws, args.prime, args.checkpoints):
                print(f"p = {args.prime} {name:27s} error={f.error:.2e} ||X||_S1 - p={f.nuclear - args.prime:.2e} {stopped(f)}",
                      flush=True)
        case "cubic":
            for p in args.primes:
                for seed, f, norm in cubic_splits(solver, p, args.cap):
                    print(f"p = {p:3d} training split, seed {seed:2d}: error={f.error:.4f} ||X||_S1={f.nuclear:9.3f}"
                          f" = {f.nuclear / p ** 1.5:.4f} p^(3/2), ||K||_S1={norm:9.3f} {stopped(f)}", flush=True)
        case "characters":
            for p in args.primes:
                for c in character_check(solver, p, args.cap):
                    print(f"p = {p:3d} {c.table:11s} seed {c.seed:2d}: rigid on supports={int(c.rigid)}"
                          f" bijection={int(c.matched)} error={c.error:.2e} max|X| on zero lines={c.zero_lines:.1e}"
                          f" decoded={100 * c.decoded:.2f}% ||X||_S1={c.nuclear:.3f} steps={c.steps}", flush=True)
        case "zeros":
            totals: dict[str, list[ClassSummary]] = {name: [] for name in G_CLASSES}
            for table in zero_tables(TorchDraws(args.seed), args.tight):
                print(table.name)
                for s in sweep(solver, table.groups, table.a, table.b, args.steps, lambda c: c.error_of_table):
                    totals[s.name].append(s)
                    print(line(s), flush=True)
            print("all tables")
            for name, parts in totals.items():
                if parts:
                    print(line(merge(name, parts)))
        case "slow":
            for stop, s in slow_tight_hall(solver, args.size, args.checkpoints):
                print(f"after {stop:7d} steps:", line(s).strip(), flush=True)
