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
#: Seven tasks [a + b ∈ A] with |A| = (p − 1)/2: the same two answers with the same frequencies,
#: sets A that differ only in their spectrum (2026-10-29). Predictions recorded before they ran:
#: accuracy falls with κ; if the network learns what the peak carries and not the flat rest, then
#: with j points of the interval swapped the vote of each sum is right on the p − 2j sums outside
#: the swaps and wrong on the 2j swapped ones, an accuracy near (p − 2j)/p; if the interval itself is
#: not learned, the hypothesis that a peaked spectrum decides fails.
SPECTRUM = ("sum-interval", "sum-interval-2", "sum-interval-4", "sum-interval-8", "sum-interval-12",
            "sum-random-half", "sum-squares")
#: Six powers (a + b)^m on which two predictions disagree, recorded before they ran (2026-10-29).
#: Their κ at p = 97, 0.1640, 0.1205, 0.0880, 0.0616, 0.0241 and 0.0221, lies below 0.2756, the
#: least κ of a task that reached 99%, so κ predicts that none reaches 99%. Read through Gaussian
#: periods, ρ(c^m) = Σ_{ζ^m = 1} ω^{ζc}, the table has rank d = gcd(m, 96): 4, 6, 8, 12, 24, 32.
#: Model M (least nuclear norm) recovers it exactly from the training cells of seeds 7 and 11 for
#: d ≤ 12 and not for d = 24, 32, so "M recovers ρ(F) for an injective ρ" predicts 99% for the
#: first four.
RECOVERY = ("sum-pow4", "sum-pow6", "sum-pow8", "sum-pow12", "sum-pow24", "sum-pow32")
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
