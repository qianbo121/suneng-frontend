import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import phase_runtime as runtime


class PhaseRuntimeTest(unittest.TestCase):
    def test_success_failure_and_timeout_record_monotonic_elapsed(self):
        for error, category in [(None, None), (RuntimeError('secret credential'), 'check-failed'),
                                (subprocess.TimeoutExpired(['secret command'], 1), 'timeout')]:
            with self.subTest(category=category), tempfile.TemporaryDirectory() as tmp:
                def action(attempt):
                    if error is not None:
                        raise error
                    return {'passed': True}
                with patch.object(runtime.time, 'monotonic', side_effect=[20, 24.5]):
                    if error:
                        with self.assertRaises(type(error)):
                            runtime.run_phase(tmp, 'preflight', action, identity={'manifest': 'one'})
                    else:
                        self.assertTrue(runtime.run_phase(tmp, 'preflight', action, identity={'manifest': 'one'})['passed'])
                state = runtime.status(tmp)['attempts'][0]
                self.assertEqual(state['elapsedSeconds'], 4.5)
                self.assertTrue(state['startedAt'])
                self.assertTrue(state['endedAt'])
                self.assertEqual(state['status'], 'failed' if error else 'succeeded')
                self.assertEqual(state['failureCategory'], category)
                self.assertNotIn('secret', ''.join(p.read_text() for p in Path(tmp).rglob('*.json')))

    def test_status_is_read_only_and_missing_directory_stays_missing(self):
        with tempfile.TemporaryDirectory() as tmp:
            missing = Path(tmp) / 'missing'
            self.assertFalse(runtime.status(missing)['applyAttempted'])
            self.assertFalse(missing.exists())
            runtime.run_phase(tmp, 'preflight', lambda _: True, identity={'one': 1})
            before = {p: (p.read_bytes(), p.stat().st_mtime_ns) for p in Path(tmp).rglob('*.json')}
            runtime.status(tmp)
            self.assertEqual(before, {p: (p.read_bytes(), p.stat().st_mtime_ns) for p in before})

    def test_failed_preflight_resumes_only_explicitly_and_keeps_old_receipts(self):
        with tempfile.TemporaryDirectory() as tmp:
            def fail(_):
                raise RuntimeError('failed')
            with self.assertRaises(RuntimeError):
                runtime.run_phase(tmp, 'preflight', fail, identity={'one': 1})
            old = {p: p.read_bytes() for p in Path(tmp).rglob('*.json')}
            with self.assertRaises(runtime.ResumeRefused):
                runtime.run_phase(tmp, 'preflight', lambda _: True, identity={'one': 1})
            self.assertTrue(runtime.run_phase(tmp, 'preflight', lambda _: True, identity={'one': 1}, resume=True))
            self.assertEqual(len(runtime.status(tmp)['attempts']), 2)
            for path, data in old.items():
                self.assertEqual(path.read_bytes(), data)

    def test_resume_requires_existing_preflight_and_same_release(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(runtime.ResumeRefused):
                runtime.run_phase(tmp, 'preflight', lambda _: True, identity={'one': 1}, resume=True)
            runtime.run_phase(tmp, 'preflight', lambda _: True, identity={'one': 1})
            with self.assertRaises(runtime.ResumeRefused):
                runtime.run_phase(tmp, 'preflight', lambda _: True, identity={'one': 2}, resume=True)

    def test_apply_success_failure_or_interruption_never_repeats(self):
        for error in [None, RuntimeError('failed'), KeyboardInterrupt()]:
            with self.subTest(error=type(error).__name__), tempfile.TemporaryDirectory() as tmp:
                def action(_):
                    if error is not None:
                        raise error
                    return True
                try:
                    runtime.run_phase(tmp, 'apply', action, identity={'one': 1})
                except BaseException:
                    pass
                self.assertTrue(runtime.status(tmp)['applyAttempted'])
                for phase, resume in [('apply', False), ('apply', True), ('preflight', True)]:
                    with self.assertRaises(runtime.ResumeRefused):
                        runtime.run_phase(tmp, phase, lambda _: self.fail('must not execute'), identity={'one': 1}, resume=resume)

    def test_started_apply_without_finish_requires_reconciliation(self):
        with tempfile.TemporaryDirectory() as tmp:
            attempt = Path(tmp) / 'attempt-1'
            attempt.mkdir()
            runtime.exclusive_json(attempt / 'started.json', {'phase': 'apply', 'startedAt': 'now'})
            self.assertEqual(runtime.status(tmp)['attempts'][0]['status'], 'interrupted')
            with self.assertRaises(runtime.ResumeRefused):
                runtime.run_phase(tmp, 'apply', lambda _: True, identity={})


if __name__ == '__main__':
    unittest.main()
