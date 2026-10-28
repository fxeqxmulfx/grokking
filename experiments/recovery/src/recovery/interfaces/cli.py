"""The checks from the command line: `uv run --locked recovery <check> …` inside this project."""

import argparse

from recovery.application.summary import ClassSummary, merge
from recovery.application.sweeps import (
    G_CLASSES, equal_weights, slow_tight_hall, sweep, weighted_tables, zero_tables,
)
from recovery.infrastructure.admm import TorchADMM
from recovery.infrastructure.draws import TorchDraws


def line(s: ClassSummary) -> str:
    return (f"  {s.name:24s} patterns={s.count:6d} recovered={s.recovered:6d}"
            f" gap in [{s.gap[0]:+.2e}, {s.gap[1]:+.2e}] error in [{s.error[0]:.2e}, {s.error[1]:.2e}]")


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
    zeros = checks.add_parser("zeros", help="Theorem G: every pattern of tables with zero entries")
    zeros.add_argument("steps", type=int)
    zeros.add_argument("--seed", type=int, default=0)
    zeros.add_argument("--tight", action="store_true", help="moduli with exact ties instead of generic ones")
    slow = checks.add_parser("slow", help="rigid patterns of ones with a tight Hall condition, run longer")
    slow.add_argument("size", type=int)
    slow.add_argument("checkpoints", type=int, nargs="+")
    args = parser.parse_args()
    solver = TorchADMM(args.device)
    print(f"device {solver.device}", flush=True)
    match args.check:
        case "equal":
            print(f"{args.size} x {args.size}, J, {args.steps} steps")
            for s in equal_weights(solver, args.size, args.steps):
                print(line(s), flush=True)
        case "weighted":
            for table in weighted_tables(TorchDraws(args.seed), args.size, args.draws):
                print(f"{table.name}: |a| = {[round(abs(x), 3) for x in table.a]}, |b| = {[round(abs(x), 3) for x in table.b]}")
                for s in sweep(solver, table.groups, table.a, table.b, args.steps, lambda c: c.error_of_hidden):
                    print(line(s), flush=True)
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
