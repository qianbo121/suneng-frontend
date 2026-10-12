import hashlib
import os
from pathlib import Path
import tempfile
import unittest

import verify_recovery_materials as recovery


class RecoveryRead(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.file = self.root/'actual.json'
        self.raw = b'{"actual":true}\n'
        self.file.write_bytes(self.raw)
        self.sha = hashlib.sha256(self.raw).hexdigest()

    def test_full_read_binds_bytes_and_actual_file_identity(self):
        record, raw, stamp = recovery.full_read(self.file, self.sha, len(self.raw), capture=True)
        self.assertEqual(raw, self.raw)
        self.assertEqual(record['sha256'], self.sha)
        self.assertTrue(record['fullReadMatched'])
        self.assertEqual(stamp, recovery.check_path(self.file)[1])

    def test_wrong_checksum_is_not_a_verified_archive(self):
        with self.assertRaisesRegex(ValueError, 'complete-sha-mismatch'):
            recovery.full_read(self.file, 'f'*64)

    def test_truncated_archive_is_not_a_verified_archive(self):
        with self.assertRaisesRegex(ValueError, 'complete-size-mismatch'):
            recovery.full_read(self.file, self.sha, len(self.raw)+1)

    def test_symlink_refused(self):
        link = self.root/'linked.json'
        link.symlink_to(self.file)
        with self.assertRaisesRegex(ValueError, 'symlink-rejected'):
            recovery.full_read(link, self.sha)

    def test_hard_link_refused(self):
        os.link(self.file, self.root/'shared.json')
        with self.assertRaisesRegex(ValueError, 'ordinary-single-link-file-required'):
            recovery.full_read(self.file, self.sha)


if __name__ == '__main__':
    unittest.main()
