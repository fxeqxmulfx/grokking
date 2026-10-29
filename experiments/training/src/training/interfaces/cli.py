"""The course's trainings and peaks from the command line: `uv run --locked training <command> …`
inside this project."""

import os

# Deterministic cuBLAS, set before torch creates its first CUDA handle (grok-simple.py does the same).
os.environ.setdefault("CUBLAS_WORKSPACE_CONFIG", ":4096:8")

import argparse  # noqa: E402
import json  # noqa: E402
from dataclasses import asdict  # noqa: E402
from pathlib import Path  # noqa: E402

from training.application.peaks import ALL, peaks  # noqa: E402
from training.application.ports import OPTIMIZERS, Peak, RunSpec  # noqa: E402
from training.application.runs import COURSE, Summary, stored, train_all  # noqa: E402
from training.domain.tasks import FORMULA  # noqa: E402

HERE = Path(__file__).resolve().parents[3]


def specs(args: argparse.Namespace) -> list[RunSpec]:
    return [RunSpec(task, seed, args.optimizer, learning_rate=args.lr, steps=args.steps,
                    report_every=args.report_every) for task in args.tasks for seed in args.seeds]


def row(s: Summary) -> str:
    def step(x: int | None) -> str:
        return "—" if x is None else str(x)
    formula = FORMULA.get(s.spec.task, s.spec.task)
    return (f"{s.spec.task:16s} {formula:28s} seed {s.spec.seed:3d}  val99 {step(s.validation_99):>6s}"
            f"  train99 {step(s.train_99):>6s}  val {100 * s.validation_accuracy:6.2f}%"
            f"  train {100 * s.train_accuracy:6.2f}%  parity {100 * s.validation_parity:6.2f}%"
            f"  {s.seconds:6.1f}s")


def main() -> None:
    parser = argparse.ArgumentParser(prog="training", description=__doc__)
    parser.add_argument("--device", default="cuda", help="cuda (the default) or cpu")
    commands = parser.add_subparsers(dest="command", required=True)
    for name, text in (("train", "train the course's network, resuming finished runs"),
                       ("report", "summarize the finished runs")):
        command = commands.add_parser(name, help=text)
        command.add_argument("--tasks", nargs="+", default=list(COURSE), choices=sorted(FORMULA))
        command.add_argument("--seeds", type=int, nargs="+", default=[7, 11])
        command.add_argument("--optimizer", choices=OPTIMIZERS, default="adamw")
        command.add_argument("--lr", type=float, default=1e-3)
        command.add_argument("--steps", type=int, default=10_000)
        command.add_argument("--report-every", type=int, default=500)
        command.add_argument("--runs", type=Path, default=HERE / "runs")
    kappa = commands.add_parser("kappa", help="the peak κ of every task, resuming a results file")
    kappa.add_argument("out", type=Path, help="JSON file of results, read first if it exists")
    kappa.add_argument("primes", type=int, nargs="+")
    kappa.add_argument("--tasks", nargs="+", default=list(ALL), choices=ALL)
    args = parser.parse_args()

    if args.command == "kappa":
        from training.infrastructure.kappa import TorchPeaks
        known = {k: Peak(**v) for k, v in json.loads(args.out.read_text()).items()} if args.out.exists() else {}
        for key, peak in peaks(TorchPeaks(args.device), tuple(args.tasks), tuple(args.primes), known):
            known[key] = peak
            print(f"{key:24s} κ={peak.kappa:.4f} hits={peak.hits:3d}/{peak.starts} "
                  f"κ_ψ={peak.kappa_psi:.4f} (r={peak.r_psi})", flush=True)
            args.out.write_text(json.dumps({k: asdict(v) for k, v in known.items()}, indent=1))
        return

    from training.infrastructure.trainer import TorchTrainer
    trainer = TorchTrainer(args.runs, args.device)
    summaries = train_all(trainer, specs(args)) if args.command == "train" else stored(trainer, specs(args))
    for s in summaries:
        print(row(s))


if __name__ == "__main__":
    main()
