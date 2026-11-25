import contextlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import storage_reservations as ledger
import frontend_release


class WebsiteStorageTest(unittest.TestCase):
    def test_failed_release_clears_exact_reservation_and_keeps_other_system(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'other-system-reservations.json'
            path.write_text(json.dumps({'factory':277}))
            with self.assertRaisesRegex(RuntimeError,'发布中断'):
                with ledger.reserve(path,5*1024**3,('boot','start')):
                    self.assertEqual(ledger.read(path)['website']['bytes'],5*1024**3)
                    raise RuntimeError('发布中断')
            self.assertEqual(ledger.read(path),{'factory':277})

    def test_active_and_stale_leases_use_boot_and_process_identity(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'other-system-reservations.json'
            with patch.object(Path,'read_text',autospec=True,return_value='boot'),patch.object(ledger,'process_identity',return_value='tick'):
                old={'boot':'boot','pid':100,'start':'prior','token':'stale','bytes':800}
                path.write_text(json.dumps({'website':old,'other':123}))
                self.assertEqual(ledger.total(path),123)
                with ledger.reserve(path,450,('boot','tick')):
                    self.assertEqual(ledger.total(path),573)
                    self.assertEqual(ledger.total(path,exclude='website'),123)
                    with self.assertRaises(RuntimeError):
                        with ledger.reserve(path,900,('boot','tick')):
                            self.fail('live lease replaced')
                self.assertEqual(ledger.read(path),{'other':123})

    def test_staging_reservation_visible_during_receiving_and_released_on_failure(self):
        with tempfile.TemporaryDirectory() as folder:
            home = Path(folder)
            (home / 'shared').mkdir()
            path = home / 'shared/other-system-reservations.json'
            path.write_text('{"factory":35}')
            with patch.object(ledger, 'process_identity', return_value='tick'), patch.object(Path, 'read_text', autospec=True, return_value='boot'):
                with self.assertRaisesRegex(RuntimeError, '中断'):
                    with ledger.staging_reservation(home, 240, home):
                        self.assertEqual(ledger.total(path), 275)
                        raise RuntimeError('中断')
            self.assertEqual(ledger.read(path), {'factory':35})

    def test_verified_image_import_does_not_start_when_capacity_fails(self):
        import hashlib
        import storage_policy
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder).resolve()
            candidate = root / 'candidate.json'
            candidate.write_text('{"component":"frontend","imageBytes":100}')
            archive = root / 'frontend.tar.gz'
            archive.write_bytes(b'fixture')
            digest = hashlib.sha256(candidate.read_bytes()).hexdigest()
            with patch.object(storage_policy, 'staged_import_space', return_value={'passed':False}), patch('subprocess.run') as execute:
                result = storage_policy.load_frontend_with_reservation(candidate,digest,archive,root,root)
            self.assertFalse(result['passed'])
            execute.assert_not_called()
