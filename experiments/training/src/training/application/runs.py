"""The trainings the course quotes, and what each one shows."""

from dataclasses import dataclass

from training.application.ports import RunResult, RunSpec, Trainer

#: The ten tasks predicted from κ before they ran (2026-10-28), the two controls, and the task on
#: which a strong mode does not suffice.
PREDICTED_LEARN = ("mul", "square-times", "affine-product", "sum-square", "perm-add", "cube-plus", "sum-cube")
PREDICTED_FAIL = ("square-product", "quadratic-linear", "cubic-mixed")
CONTROLS = ("cubic-product", "quadratic")
CONVERSE = ("parity-cubic",)
#: Two tasks g(a + b) on which two predictions disagree, recorded before they ran (2026-10-29). Their
#: κ, 0.0427 and 0.0125 at p = 97, lies below that of every task that failed, so κ predicts failure;
#: a + b has rank one under ψ, so the hypothesis "g of a rank-one h is learned" predicts success.
DISAGREE = ("sum-pow16", "sum-pow48")
COURSE = PREDICTED_LEARN + PREDICTED_FAIL + CONTROLS + CONVERSE + DISAGREE


@dataclass(frozen=True)
class Summary:
    """What a run shows: when it first reached 99% and where it ended."""

    spec: RunSpec
    #: The first reported step with accuracy at least 99%, or None.
    train_99: int | None
    validation_99: int | None
    train_accuracy: float
    validation_accuracy: float
    #: The share of held-out equations whose predicted answer has the right parity.
    validation_parity: float
    steps: int
    seconds: float


def first_reaching(result: RunResult, split: str, level: float = 0.99) -> int | None:
    key = f"{split}_accuracy"
    return next((r.step for r in result.reports if getattr(r, key) >= level), None)


def summarize(result: RunResult) -> Summary:
    last = result.reports[-1]
    parity = sum((answer - prediction) % 2 == 0 for _, _, answer, prediction in result.validation)
    return Summary(result.spec, first_reaching(result, "train"), first_reaching(result, "validation"),
                   last.train_accuracy, last.validation_accuracy, parity / len(result.validation),
                   last.step, result.seconds)


def train_all(trainer: Trainer, specs: list[RunSpec]) -> list[Summary]:
    """Every run in order; a finished run is read back, not trained again."""
    return [summarize(trainer.run(spec)) for spec in specs]


def stored(trainer: Trainer, specs: list[RunSpec]) -> list[Summary]:
    """The finished runs among `specs`."""
    return [summarize(r) for spec in specs if (r := trainer.stored(spec)) is not None]
