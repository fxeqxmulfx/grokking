"""What the application needs from the outside: a trainer and a solver for the peak κ."""

from dataclasses import dataclass
from typing import Protocol

#: The optimizers a run can use: AdamW with a linear warmup, as grok-simple.py, or Schedule-Free
#: AdamW, the optimizer of the course's network.
OPTIMIZERS = ("adamw", "schedule-free-adamw")


@dataclass(frozen=True)
class RunSpec:
    """One training run of the course's network: grok-simple.py's protocol and defaults."""

    task: str
    seed: int
    optimizer: str = "adamw"
    modulus: int = 97
    train_fraction: float = 0.5
    width: int = 128
    depth: int = 1
    #: SwiGLU hidden units; None is grok-simple's (8 width + 1) // 3, 341 at width 128.
    hidden: int | None = None
    learning_rate: float = 1e-3
    weight_decay: float = 1.0
    warmup: int = 10
    steps: int = 10_000
    #: None is grok-simple's min(512, training equations // 2).
    batch: int | None = None
    report_every: int = 500

    @property
    def label(self) -> str:
        """`<optimizer>-lr<rate>/<task>-<seed>`, with `-w<width>`, `-d<depth>` and `-s<steps>` after the
        rate when they differ from grok-simple's 128, 1 and 10 000."""
        shape = ((f"-w{self.width}" if self.width != 128 else "") + (f"-d{self.depth}" if self.depth != 1 else "")
                 + (f"-s{self.steps}" if self.steps != 10_000 else ""))
        return f"{self.optimizer}-lr{self.learning_rate:g}{shape}/{self.task.replace('/', '-')}-{self.seed}"


@dataclass(frozen=True)
class Report:
    """Accuracy and cross-entropy on both complete splits at one step."""

    step: int
    train_loss: float
    validation_loss: float
    train_accuracy: float
    validation_accuracy: float


@dataclass(frozen=True)
class RunResult:
    """A finished run: its reports and the predictions on the held-out equations."""

    spec: RunSpec
    reports: tuple[Report, ...]
    #: (a, b, answer, prediction) for every validation equation, after the last step.
    validation: tuple[tuple[int, int, int, int], ...]
    seconds: float


class Trainer(Protocol):
    def run(self, spec: RunSpec) -> RunResult:
        """Train, or return the stored result of a finished run with the same spec."""
        ...

    def stored(self, spec: RunSpec) -> RunResult | None:
        """The stored result of a finished run with this spec, if any."""
        ...


@dataclass(frozen=True)
class Peak:
    """The peak κ of one table and the best additive-character readout ψ_r."""

    kappa: float
    #: Starts whose value is within 1e-3 of the best.
    hits: int
    starts: int
    kappa_psi: float
    r_psi: int


class PeakSolver(Protocol):
    def peak(self, table: list[list[int]], p: int, seed: int) -> Peak:
        """κ of the table under phase readouts, by alternating maximization from many starts."""
        ...
