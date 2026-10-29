"""The tasks, the split, the optimizers, a tiny training run and the peak κ."""

import math
import tempfile
import unittest
from pathlib import Path

import torch

from training.application.peaks import peaks
from training.application.ports import RunSpec
from training.application.runs import COURSE, summarize
from training.domain.splits import Sampler, split
from training.domain.tasks import FORMULA, TASKS, permutation, table, task
from training.infrastructure.kappa import TorchPeaks, primitive_root
from training.infrastructure.optimizers import ScheduleFreeAdamW
from training.infrastructure.trainer import TorchTrainer


class Tasks(unittest.TestCase):
    def test_values(self) -> None:
        p = 7
        self.assertEqual(TASKS["add"](3, 5, p), 1)
        self.assertEqual(TASKS["div"](3, 5, p), 3 * 3 % p)  # 5⁻¹ = 3 mod 7
        self.assertEqual(TASKS["cubic-product"](2, 3, p), (8 + 6) % p)
        self.assertEqual(TASKS["parity-cubic"](2, 3, p), 1)  # c = 0, a + b odd
        self.assertEqual(task("parity-cubic/blind")(2, 3, p), 0)
        self.assertEqual(sorted(permutation(p)), list(range(p)))
        self.assertEqual(set(FORMULA), set(TASKS))
        self.assertTrue(set(COURSE) <= set(TASKS))

    def test_tables(self) -> None:
        p = 5
        self.assertEqual(len(table("div", p)[0]), p - 1)
        self.assertEqual(table("div", p)[2][0], 2)  # 2 / 1
        pi = permutation(p)
        self.assertEqual(table("perm-add", p)[1][3], pi[4])
        for name in TASKS:
            self.assertTrue(all(0 <= x < p for r in table(name, p) for x in r) or name in ("abs-diff", "max"))


class Splits(unittest.TestCase):
    def test_split(self) -> None:
        s = split("add", 11, 0.5, 7)
        self.assertEqual((len(s.train), len(s.validation)), (60, 61))
        self.assertEqual(sorted(s.train + s.validation), sorted((a, b, (a + b) % 11) for a in range(11) for b in range(11)))
        self.assertEqual(split("add", 11, 0.5, 7), s)
        self.assertNotEqual(split("add", 11, 0.5, 11).train, s.train)
        self.assertTrue(all(b != 0 for _, b, _ in split("div", 11, 0.5, 7).train))

    def test_sampler_visits_every_row_once_per_epoch(self) -> None:
        sampler = Sampler(10, 7)
        epoch = sampler.sample(4) + sampler.sample(4) + sampler.sample(4)
        self.assertEqual(sorted(epoch), list(range(10)))


class Optimizers(unittest.TestCase):
    def test_schedule_free_modes_round_trip(self) -> None:
        torch.manual_seed(0)
        w = torch.nn.Parameter(torch.randn(5))
        opt = ScheduleFreeAdamW([w], lr=0.1, betas=(0.9, 0.98), weight_decay=0.1, warmup=2)
        for _ in range(3):
            opt.zero_grad()
            (w.square().sum()).backward()
            opt.step()
        y = w.detach().clone()
        opt.eval()
        x = w.detach().clone()
        z = opt.state[w]["base"]
        torch.testing.assert_close(x, y + (1 - 1 / 0.9) * (z - y))
        opt.train()
        torch.testing.assert_close(w.detach(), y)
        opt.eval()
        with self.assertRaises(RuntimeError):
            opt.step()

    def test_schedule_free_first_step(self) -> None:
        # t = 1, warmup 0: c = 1, so y moves to z and both take the plain normalized step.
        w = torch.nn.Parameter(torch.tensor([2.0]))
        opt = ScheduleFreeAdamW([w], lr=0.5, betas=(0.9, 0.98), eps=0.0)
        w.grad = torch.tensor([3.0])
        opt.step()
        torch.testing.assert_close(w.detach(), torch.tensor([1.5]))
        torch.testing.assert_close(opt.state[w]["base"], torch.tensor([1.5]))


class Training(unittest.TestCase):
    def test_tiny_runs(self) -> None:
        with tempfile.TemporaryDirectory() as root:
            trainer = TorchTrainer(Path(root), "cpu", echo=False)
            for optimizer in ("adamw", "schedule-free-adamw"):
                spec = RunSpec("add", 7, optimizer, modulus=11, width=8, steps=40, report_every=20, batch=16)
                result = trainer.run(spec)
                self.assertEqual([r.step for r in result.reports], [0, 20, 40])
                self.assertEqual(len(result.validation), 61)
                again = trainer.run(spec)
                self.assertEqual(again.reports, result.reports)
                s = summarize(result)
                self.assertTrue(0 <= s.validation_parity <= 1)
                with self.assertRaises(ValueError):
                    trainer.stored(RunSpec("add", 7, optimizer, modulus=11, width=8, steps=41, report_every=20,
                                           batch=16))

    def test_runs_repeat_exactly(self) -> None:
        with tempfile.TemporaryDirectory() as one, tempfile.TemporaryDirectory() as two:
            spec = RunSpec("mul", 11, "schedule-free-adamw", modulus=11, width=8, steps=30, report_every=10, batch=16)
            a = TorchTrainer(Path(one), "cpu", echo=False).run(spec)
            b = TorchTrainer(Path(two), "cpu", echo=False).run(spec)
            self.assertEqual(a.reports, b.reports)
            self.assertEqual(a.validation, b.validation)


class Peaks(unittest.TestCase):
    def test_primitive_root(self) -> None:
        self.assertEqual([primitive_root(p) for p in (3, 5, 7, 11, 13, 97)], [2, 2, 3, 2, 2, 5])

    def test_known_peaks(self) -> None:
        solver = TorchPeaks("cpu")
        p = 11
        # ψ(a + b) = ψ(a) ψ(b): one centered mode carries everything.
        add = solver.peak(table("add", p), p, 1)
        self.assertAlmostEqual(add.kappa, 1.0, places=5)
        self.assertAlmostEqual(add.kappa_psi, 1.0, places=9)
        # ψ(ab) has every singular value √p and its centered kernel σ₁² = p, so κ_ψ = 1/p.
        mul = solver.peak(table("mul", p), p, 1)
        self.assertAlmostEqual(mul.kappa_psi, 1 / p, places=9)
        # Through a multiplicative character χ: g = χ/√(p − 1), h = χ̄/√(p − 1) off 0 give σ₁ ≥ p − 1.
        self.assertGreater(mul.kappa, ((p - 1) / p) ** 2 - 1e-4)
        self.assertEqual(add.starts, (p - 1) + (p - 2) + 1 + 8 + 256)
        found = dict(peaks(solver, ("add",), (5,), {}))
        self.assertEqual(set(found), {"5:add"})
        self.assertTrue(math.isfinite(found["5:add"].kappa))


if __name__ == "__main__":
    unittest.main()
