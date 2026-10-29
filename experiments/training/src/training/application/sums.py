"""Where the finished runs of a task of a + b go wrong: the validation accuracy from a given step
on, and the wrong held-out equations along each sum c = a + b mod p, with the vote and the
frequency guess of the README."""

from collections import Counter, defaultdict
from dataclasses import dataclass

from training.application.ports import RunResult, RunSpec, Trainer


@dataclass(frozen=True)
class SumErrors:
    spec: RunSpec
    #: The lowest and the highest validation accuracy reported from step `since` on.
    low: float
    high: float
    #: The highest validation accuracy of the run and the first step that reports it.
    best: float
    best_step: int
    held: int
    #: The wrong held-out equations on each sum c that has one.
    wrong: dict[int, int]
    #: The sums whose most common prediction is not their answer, or not the only most common one.
    vote_wrong: tuple[int, ...]
    #: Σ_v q_v², q_v the share of the held-out equations with answer v: the accuracy of guessing
    #: each answer with its frequency.
    frequency_guess: float


def sum_errors(result: RunResult, since: int) -> SumErrors:
    """The errors of one run by sum; its task must take one answer on each sum a + b."""
    p = result.spec.modulus
    accuracies = [(r.step, r.validation_accuracy) for r in result.reports]
    late = [accuracy for step, accuracy in accuracies if step >= since]
    if not late:
        raise ValueError(f"{result.spec.label} reports nothing from step {since} on")
    best_step, best = max(accuracies, key=lambda report: report[1])
    answers: dict[int, int] = {}
    votes: defaultdict[int, Counter[int]] = defaultdict(Counter)
    for a, b, answer, prediction in result.validation:
        c = (a + b) % p
        if answers.setdefault(c, answer) != answer:
            raise ValueError(f"{result.spec.task} takes two answers on the sum {c}")
        votes[c][prediction] += 1

    def vote_right(c: int) -> bool:
        (top, count), *rest = votes[c].most_common(2)
        return top == answers[c] and (not rest or rest[0][1] < count)

    wrong = Counter((a + b) % p for a, b, answer, prediction in result.validation if prediction != answer)
    held = len(result.validation)
    frequencies = Counter(answer for _, _, answer, _ in result.validation)
    return SumErrors(result.spec, min(late), max(late), best, best_step, held, dict(wrong),
                     tuple(c for c in sorted(votes) if not vote_right(c)),
                     sum((n / held) ** 2 for n in frequencies.values()))


def stored_sums(trainer: Trainer, specs: list[RunSpec], since: int) -> list[SumErrors]:
    """The errors by sum of the finished runs among `specs`."""
    return [sum_errors(r, since) for spec in specs if (r := trainer.stored(spec)) is not None]
