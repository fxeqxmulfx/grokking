"""Training runs on disk: grok-simple's loop, with AdamW or Schedule-Free AdamW.

The loop is grokking_abmod's `scripts/grok-simple.py` (`main`): raw residues as inputs, the seeded
split and minibatch order, the answer-only cross-entropy, deterministic algorithms without TF32,
and complete-split reports. AdamW has betas (0.9, 0.98), ε = 1e-8, decay on every weight and
grok-simple's linear warmup, lr · min(t, warmup)/warmup. Schedule-Free AdamW has the same
settings and its own warmup; its reports, predictions and saved weights are those of the
average x (`eval()`), the weights it returns. Deviation from grok-simple: no per-report
checkpoint, equations.csv or symbols.csv; the run is stored as `run.json` and `model.pt`.
"""

import json
import time
from dataclasses import asdict
from pathlib import Path

import torch
from torch.nn import functional as F

from training.application.ports import Report, RunResult, RunSpec
from training.domain.splits import Sampler, split
from training.infrastructure.model import Rotate90
from training.infrastructure.optimizers import ScheduleFreeAdamW


@torch.no_grad()
def evaluate(model: Rotate90, a: torch.Tensor, b: torch.Tensor, answers: torch.Tensor) -> tuple[float, float]:
    """Answer cross-entropy (f64 from f32 logits) and accuracy over a complete split."""
    logits = model(a, b).double()
    return F.cross_entropy(logits, answers).item(), (logits.argmax(-1) == answers).sum().item() / len(answers)


class TorchTrainer:
    """Runs under `root/<optimizer>-lr<rate>/<task>-<seed>/`; a finished run is read back, not redone."""

    def __init__(self, root: Path, device: str, echo: bool = True) -> None:
        self.root, self.device, self.echo = root, torch.device(device), echo

    def directory(self, spec: RunSpec) -> Path:
        return self.root / spec.label

    def stored(self, spec: RunSpec) -> RunResult | None:
        path = self.directory(spec) / "run.json"
        if not path.exists():
            return None
        data = json.loads(path.read_text())
        if data["spec"] != asdict(spec):
            raise ValueError(f"{path} holds a run with other settings")
        if data["status"] != "complete":
            return None
        return RunResult(spec, tuple(Report(**r) for r in data["reports"]),
                         tuple(tuple(row) for row in data["validation"]), data["seconds"])

    def run(self, spec: RunSpec) -> RunResult:
        return self.stored(spec) or self.train(spec)

    def train(self, spec: RunSpec) -> RunResult:
        torch.use_deterministic_algorithms(True)
        torch.backends.cuda.matmul.allow_tf32 = False
        torch.backends.cudnn.allow_tf32 = False
        device, out = self.device, self.directory(spec)
        out.mkdir(parents=True, exist_ok=True)
        equations = split(spec.task, spec.modulus, spec.train_fraction, spec.seed)
        data = {name: torch.tensor(rows, device=device).unbind(1)
                for name, rows in (("train", equations.train), ("validation", equations.validation))}
        count = len(equations.train)
        batch = spec.batch or min(512, count // 2)
        hidden = spec.hidden or (8 * spec.width + 1) // 3
        model = Rotate90(spec.modulus, spec.width, spec.depth, hidden, spec.seed).to(device)
        settings = {"lr": spec.learning_rate, "betas": (0.9, 0.98), "eps": 1e-8, "weight_decay": spec.weight_decay}
        free = spec.optimizer == "schedule-free-adamw"
        if free:
            optimizer = ScheduleFreeAdamW(model.parameters(), warmup=spec.warmup, **settings)
        elif spec.optimizer == "adamw":
            optimizer = torch.optim.AdamW(model.parameters(), **settings)
        else:
            raise ValueError(f"unknown optimizer {spec.optimizer}")
        meta = {"spec": asdict(spec), "status": "running", "batch": batch, "hidden": hidden,
                "device": str(device), "torch": torch.__version__}
        (out / "run.json").write_text(json.dumps(meta))
        reports: list[Report] = []
        start = time.perf_counter()

        def record(step: int) -> None:
            if free:
                optimizer.eval()
            train_loss, train_accuracy = evaluate(model, *data["train"])
            validation_loss, validation_accuracy = evaluate(model, *data["validation"])
            if free:
                optimizer.train()
            reports.append(Report(step, train_loss, validation_loss, train_accuracy, validation_accuracy))
            if self.echo:
                print(f"{spec.label} step {step:>6}: train CE={train_loss:.5f} accuracy={100 * train_accuracy:.2f}%;"
                      f" validation CE={validation_loss:.5f} accuracy={100 * validation_accuracy:.2f}%", flush=True)

        record(0)
        sampler = Sampler(count, spec.seed)
        a, b, answers = data["train"]
        for step in range(1, spec.steps + 1):
            rows = torch.tensor(sampler.sample(batch), device=device)
            if not free:
                ramp = min(step, spec.warmup) / spec.warmup if spec.warmup else 1.0
                for group in optimizer.param_groups:
                    group["lr"] = spec.learning_rate * ramp
            optimizer.zero_grad(set_to_none=True)
            F.cross_entropy(model(a[rows], b[rows]), answers[rows]).backward()
            optimizer.step()
            if step % spec.report_every == 0 or step == spec.steps:
                record(step)
        if free:
            optimizer.eval()
        with torch.no_grad():
            va, vb, vanswers = data["validation"]
            predictions = model(va, vb).argmax(-1)
        validation = tuple(zip(va.tolist(), vb.tolist(), vanswers.tolist(), predictions.tolist()))
        seconds = time.perf_counter() - start
        torch.save(model.state_dict(), out / "model.pt")
        meta |= {"status": "complete", "seconds": seconds, "reports": [asdict(r) for r in reports],
                 "validation": validation}
        (out / "run.json").write_text(json.dumps(meta))
        return RunResult(spec, tuple(reports), validation, seconds)
