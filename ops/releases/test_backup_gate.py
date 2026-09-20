import datetime
import gzip
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from backup_gate import verify_daily_backup

class BackupGateTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.now = datetime.datetime.now(datetime.timezone.utc)
        self.names = ['db-20260919-020000.sql.gz', 'uploads-20260919-020000.tar.gz']
        checks = []
        for name in self.names:
            payload = gzip.compress(b'fixture backup')
            (self.root / name).write_bytes(payload)
            checks.append(hashlib.sha256(payload).hexdigest() + '  ' + name)
        (self.root / 'backup-20260919-020000.sha256').write_text('\n'.join(checks))
        self.report = {'status':'ok', 'finishedAt':self.now.isoformat(),
            'database':{'file':self.names[0], 'tables':28}, 'uploads':{'file':self.names[1], 'files':1}}
        self.save()
    def tearDown(self): self.tmp.cleanup()
    def save(self): (self.root / 'last-status.json').write_text(json.dumps(self.report))
    def test_actual_archives_pass_without_claiming_restore_or_offsite_acceptance(self):
        result = verify_daily_backup(self.root, self.now)
        self.assertTrue(result['verified'])
        self.assertFalse(result['restoreRehearsed'])
        self.assertFalse(result['offsiteVerified'])
    def test_changed_archive_is_rejected(self):
        (self.root / self.names[0]).write_bytes(b'changed')
        with self.assertRaises(ValueError): verify_daily_backup(self.root, self.now)
    def test_expired_failed_and_future_receipts_are_rejected(self):
        for status, delta in [('failed',0),('ok',-27),('ok',1)]:
            with self.subTest(status=status, delta=delta):
                self.report.update(status=status,finishedAt=(self.now+datetime.timedelta(hours=delta)).isoformat());self.save()
                with self.assertRaises(ValueError): verify_daily_backup(self.root, self.now)
    def test_mismatched_archive_pair_and_path_escape_are_rejected(self):
        for name in ['uploads-20260918-020000.tar.gz','../../etc/passwd']:
            self.report['uploads']['file']=name;self.save()
            with self.assertRaises(ValueError): verify_daily_backup(self.root, self.now)

if __name__ == '__main__': unittest.main()
