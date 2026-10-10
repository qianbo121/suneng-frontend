from datetime import datetime, timedelta, timezone
import hashlib
import io
import json
import os
from pathlib import Path
from types import SimpleNamespace
import tempfile
import unittest
from unittest.mock import patch

import storage_policy as p

CURRENT = 'sha256:' + 'a' * 64
PREVIOUS = 'sha256:' + 'b' * 64
OLDER = 'sha256:' + 'c' * 64


def snapshot(item=None):
    return {'schemaVersion': 1,
            'collectedAt': datetime.now(timezone.utc).isoformat(),
            'components': {
                'shuju-engine': {'system': 'shuju', 'verified': True, 'current': CURRENT, 'previous': PREVIOUS},
                'website-frontend': {'system': 'website', 'verified': True, 'current': CURRENT, 'previous': PREVIOUS}},
            'objects': [item or {'kind': 'image', 'imageId': OLDER, 'system': 'shuju',
                                'component': 'shuju-engine', 'inUse': False, 'protected': False,
                                'stable': True, 'referencesClear': True, 'recoveryVerified': True}]}


class CapacityTest(unittest.TestCase):
    def test_new_release_requires_more_headroom_without_blocking_emergency_rollback(self):
        with patch.object(p.shutil, 'disk_usage', return_value=SimpleNamespace(free=3*p.GIB)):
            with self.assertRaisesRegex(RuntimeError, 'Insufficient'):
                p.working_space('.')
            self.assertTrue(p.working_space('.', 'rollback')['passed'])

    def test_same_filesystem_accounts_for_two_images_and_archives_together(self):
        candidates = [{'imageTag': 'frontend:x', 'imageBytes': p.GIB, 'archiveBytes': p.GIB//2},
                      {'imageTag': 'backend:x', 'imageBytes': 2*p.GIB, 'archiveBytes': p.GIB}]
        with tempfile.TemporaryDirectory() as root, patch.object(p.shutil, 'disk_usage', return_value=SimpleNamespace(free=12*p.GIB)):
            result = p.import_space(candidates, root, root)
        self.assertFalse(result['passed'])
        self.assertEqual(len(result['filesystems']), 1)
        self.assertEqual(result['filesystems'][0]['requiredBytes'], int(12.5*p.GIB))

    def test_separate_filesystems_cannot_hide_a_full_image_store(self):
        def stats(path):
            return SimpleNamespace(st_dev=1 if str(path)=='/store' else 2)
        def disk(path):
            return SimpleNamespace(free=6*p.GIB if path=='/store' else 100*p.GIB)
        with patch.object(Path, 'stat', stats), patch.object(p.shutil, 'disk_usage', side_effect=disk):
            result = p.import_space([{'imageTag': 'x', 'imageBytes': p.GIB, 'archiveBytes': p.GIB}], '/store', '/staging')
        self.assertFalse(result['passed'])
        self.assertEqual(len(result['filesystems']), 2)

    def test_bad_or_duplicate_candidate_sizes_fail_closed(self):
        for value in [True, 0, -1, '100', None]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                p.import_space([{'imageTag': 'x', 'imageBytes': value, 'archiveBytes': 1}], '.', '.')
        with self.assertRaises(ValueError):
            p.import_space([{'imageTag': 'x'}]*2, '.', '.')


class StagedCapacityTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.store, self.staging = self.root / 'store', self.root / 'staging'
        self.store.mkdir(); self.staging.mkdir()
        self.archive = self.staging / 'candidate.tar.gz'
        self.archive.write_bytes(b'candidate-image' * 4096)
        self.candidate_path = self.staging / 'candidate.json'
        self.candidate = {'imageTag': 'frontend:x', 'imageBytes': p.GIB,
                          'sourceCommit': 'a' * 40,
                          'archiveBytes': self.archive.stat().st_size,
                          'archiveSha256': hashlib.sha256(self.archive.read_bytes()).hexdigest()}
        self.write_candidate(self.candidate)

    def write_candidate(self, candidate):
        raw = json.dumps(candidate).encode()
        self.candidate_path.write_bytes(raw)
        self.candidate_sha256 = hashlib.sha256(raw).hexdigest()

    def check(self):
        return p.staged_import_space(self.candidate_path, self.candidate_sha256,
                                     self.archive, self.store, self.staging)

    def test_complete_archive_is_counted_once_but_both_entire_images_are_reserved(self):
        free = p.DEPLOY_RESERVE + 2 * p.GIB
        with patch.object(p.shutil, 'disk_usage', return_value=SimpleNamespace(free=free)):
            self.assertFalse(p.import_space([self.candidate], self.store, self.staging)['passed'])
            result = self.check()
        self.assertTrue(result['passed'])
        self.assertEqual(result['phase'], 'after-verified-transfer')
        self.assertTrue(result['archiveFullReadVerified'])
        self.assertEqual(result['candidateBinding']['sha256'], self.candidate_sha256)
        self.assertEqual(result['candidateBinding']['sourceCommit'], 'a' * 40)
        self.assertEqual(result['filesystems'][0]['requiredBytes'], free)
        self.assertEqual(result['filesystems'][0]['pretransferRequiredBytes'], free + self.candidate['archiveBytes'])
        self.assertEqual(result['fullImageCopiesStillReserved'], 2)
        self.assertFalse(result['currentOrPreviousImageBytesSubtracted'])
        self.assertFalse(result['layerReuseAssumed'])
        self.assertFalse(result['deletionAuthorized'])

    def test_remaining_same_device_capacity_cannot_use_old_images_or_claimed_verification(self):
        self.write_candidate({**self.candidate, 'verified': True,
                              'currentImageBytes': 100 * p.GIB, 'previousImageBytes': 100 * p.GIB})
        with patch.object(p.shutil, 'disk_usage', return_value=SimpleNamespace(free=7*p.GIB - 1)):
            self.assertFalse(self.check()['passed'])
        with self.assertRaises(ValueError):
            p.staged_import_space(self.candidate, self.candidate_sha256,
                                  self.archive, self.store, self.staging)

    def test_separate_devices_reserve_each_device_without_cross_device_credit(self):
        original_stat = Path.stat
        def stats(path, *args, **kwargs):
            info = original_stat(path, *args, **kwargs)
            if path != self.store:
                return info
            return SimpleNamespace(st_dev=info.st_dev+1, st_ino=info.st_ino, st_mode=info.st_mode)
        for store_free, staging_free, passed in [(7*p.GIB, 5*p.GIB, True),
                                                 (7*p.GIB-1, 100*p.GIB, False),
                                                 (100*p.GIB, 5*p.GIB-1, False)]:
            def disk(path):
                return SimpleNamespace(free=store_free if Path(path) == self.store else staging_free)
            with self.subTest(store_free=store_free, staging_free=staging_free):
                with patch.object(Path, 'stat', stats), patch.object(p.shutil, 'disk_usage', side_effect=disk):
                    result = self.check()
                self.assertEqual(result['passed'], passed)
                self.assertEqual(len(result['filesystems']), 2)
                self.assertEqual(result['filesystems'][0]['requiredBytes'], 7*p.GIB)
                self.assertEqual(result['filesystems'][0]['verifiedAlreadyAllocatedArchiveBytes'], 0)
                self.assertEqual(result['filesystems'][1]['requiredBytes'], 5*p.GIB)

    def test_corrupt_archive_or_wrong_metadata_binding_fails_closed(self):
        with self.assertRaisesRegex(ValueError, 'SHA256'):
            p.staged_import_space(self.candidate_path, '0'*64, self.archive, self.store, self.staging)
        self.archive.write_bytes(b'x' * self.candidate['archiveBytes'])
        with self.assertRaisesRegex(ValueError, 'SHA256'):
            self.check()

    def test_wrong_size_sparse_archive_and_hard_link_are_rejected(self):
        self.archive.write_bytes(b'too short')
        with self.assertRaisesRegex(ValueError, 'size'):
            self.check()
        with self.archive.open('wb') as stream:
            stream.seek(2*p.GIB)
            stream.write(b'x')
        self.write_candidate({**self.candidate, 'archiveBytes': self.archive.stat().st_size})
        with self.assertRaisesRegex(ValueError, 'non-sparse'):
            self.check()
        self.archive.write_bytes(b'candidate-image' * 4096)
        self.write_candidate(self.candidate)
        os.link(self.archive, self.staging / 'duplicate.tar.gz')
        with self.assertRaisesRegex(ValueError, 'single-link'):
            self.check()

    def test_archive_file_and_parent_symlinks_are_rejected(self):
        real_archive = self.staging / 'real.tar.gz'
        self.archive.rename(real_archive)
        self.archive.symlink_to(real_archive)
        with self.assertRaisesRegex(ValueError, 'Symbolic'):
            self.check()
        alias = self.root / 'alias'
        alias.symlink_to(self.staging, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'Symbolic'):
            p.staged_import_space(alias / 'candidate.json', self.candidate_sha256,
                                  real_archive, self.store, self.staging)

    def test_archive_outside_staging_or_on_another_device_is_rejected(self):
        outside = self.root / 'outside.tar.gz'
        self.archive.rename(outside)
        with self.assertRaisesRegex(ValueError, 'inside'):
            p.staged_import_space(self.candidate_path, self.candidate_sha256,
                                  outside, self.store, self.staging)
        outside.rename(self.archive)
        original_stat = Path.stat
        def stats(path, *args, **kwargs):
            info = original_stat(path, *args, **kwargs)
            if path != self.staging:
                return info
            return SimpleNamespace(st_dev=info.st_dev+1, st_ino=info.st_ino, st_mode=info.st_mode)
        with patch.object(Path, 'stat', stats), self.assertRaisesRegex(ValueError, 'staging filesystem'):
            self.check()

    def test_archive_and_candidate_changes_during_capacity_check_are_rejected(self):
        for changed_path in (self.archive, self.candidate_path):
            with self.subTest(path=changed_path):
                def disk(path):
                    changed_path.write_bytes(changed_path.read_bytes() + b'changed')
                    return SimpleNamespace(free=100*p.GIB)
                with patch.object(p.shutil, 'disk_usage', side_effect=disk):
                    with self.assertRaisesRegex(ValueError, 'changed during the capacity'):
                        self.check()
                self.archive.write_bytes(b'candidate-image' * 4096)
                self.write_candidate(self.candidate)

    def test_mutation_during_full_read_is_rejected(self):
        original_fstat = os.fstat
        def changed_stat(fd):
            info = original_fstat(fd)
            if info.st_ino == self.archive.stat().st_ino:
                self.archive.write_bytes(b'x' * self.candidate['archiveBytes'])
            return info
        with patch.object(p.os, 'fstat', side_effect=changed_stat):
            with self.assertRaisesRegex(ValueError, 'changed during the full read'):
                self.check()

    def test_multiple_candidates_invalid_digests_and_sizes_cannot_enter_staged_path(self):
        self.write_candidate([self.candidate, self.candidate])
        with self.assertRaisesRegex(ValueError, 'Exactly one'):
            self.check()
        self.write_candidate(self.candidate)
        with patch('sys.argv', ['storage_policy.py', 'check-import-after-transfer',
                               '--candidate', str(self.candidate_path), '--candidate', str(self.candidate_path),
                               '--candidate-sha256', self.candidate_sha256, '--archive', str(self.archive)]):
            with self.assertRaisesRegex(ValueError, 'Only one'):
                p.main()
        for change in ({'archiveSha256': None}, {'archiveBytes': True}, {'imageBytes': 0}):
            self.write_candidate({**self.candidate, **change})
            with self.subTest(change=change), self.assertRaises(ValueError):
                self.check()

    def test_staged_cli_returns_success_or_low_space_without_changing_files(self):
        argv = ['storage_policy.py', 'check-import-after-transfer',
                '--candidate', str(self.candidate_path), '--candidate-sha256', self.candidate_sha256,
                '--archive', str(self.archive), '--image-store', str(self.store),
                '--staging', str(self.staging)]
        original_archive = self.archive.read_bytes()
        for free, exit_code in [(7*p.GIB, 0), (7*p.GIB-1, 75)]:
            output = io.StringIO()
            with self.subTest(free=free), patch('sys.argv', argv), patch('sys.stdout', output):
                with patch.object(p.shutil, 'disk_usage', return_value=SimpleNamespace(free=free)):
                    self.assertEqual(p.main(), exit_code)
            self.assertEqual(json.loads(output.getvalue())['passed'], exit_code == 0)
            self.assertEqual(self.archive.read_bytes(), original_archive)


class RetentionTest(unittest.TestCase):
    def test_verified_old_image_is_only_a_candidate_never_an_authorization(self):
        result=p.retention_plan(snapshot())
        self.assertEqual(result['candidateCount'], 1)
        self.assertFalse(result['executed'])
        self.assertFalse(result['deletionAuthorized'])

    def test_current_previous_in_use_or_unverified_images_are_retained(self):
        for change in [{'imageId': CURRENT}, {'imageId': PREVIOUS}, {'inUse': True},
                       {'protected': True}, {'stable': False}, {'referencesClear': False},
                       {'recoveryVerified': False}, {'component': 'unknown'}, {'system': 'furnace'}]:
            data=snapshot();data['objects'][0].update(change)
            with self.subTest(change=change):self.assertEqual(p.retention_plan(data)['candidateCount'], 0)
        data=snapshot();data['components']['shuju-engine']['verified']=False
        self.assertEqual(p.retention_plan(data)['candidateCount'], 0)

    def test_source_copy_needs_matching_archive_and_specific_path(self):
        item=snapshot()['objects'][0];item.pop('imageId');item.update(kind='source-copy',fullyCovered=True,
            isSymlink=False, ancestorsVerified=True,
            path='/opt/shuju/releases/repo-before-123abcd-20260921T000000')
        self.assertEqual(p.retention_plan(snapshot(item))['candidateCount'], 1)
        for changes in [{'fullyCovered': False}, {'path': '/data/postgres'}, {'path': '/opt/shuju/data'},
                        {'path': '/opt/shuju/releases/../data'}, {'isSymlink': True}, {'ancestorsVerified': False}]:
            with self.subTest(changes=changes):
                self.assertEqual(p.retention_plan(snapshot({**item, **changes}))['candidateCount'], 0)

    def test_business_backups_and_incomplete_restore_are_retained(self):
        base=snapshot()['objects'][0];base.pop('imageId')
        for kind in ['database-backup','business-data','configuration','uploads','recovery-archive']:
            item={**base,'kind':kind,'path':'/opt/shuju/backups/backup.sqlite3'}
            self.assertEqual(p.retention_plan(snapshot(item))['candidateCount'],0)
        drill={**base,'kind':'restore-drill','system':'website','component':'website-frontend',
               'restorePassed':False,'isSymlink':False,'ancestorsVerified':True,
               'path':'/data/migration-backups/20260921T000000Z-123abcde/data-restore-drill'}
        self.assertEqual(p.retention_plan(snapshot(drill))['candidateCount'],0)
        self.assertEqual(p.retention_plan(snapshot({**drill,'restorePassed':True}))['candidateCount'],1)

    def test_unknown_partial_and_duplicate_identity_are_rejected(self):
        base=snapshot()['objects'][0];base.pop('imageId')
        item={**base,'kind':'partial-transfer','system':'website','component':'website-frontend',
              'isSymlink':False,'ancestorsVerified':True,
              'path':'/data/migration-rehearsals/batch/candidate.tar.gz.partial'}
        self.assertEqual(p.retention_plan(snapshot(item))['candidateCount'],0)
        self.assertEqual(p.retention_plan(snapshot({**item,'truncated':True}))['candidateCount'],1)
        data=snapshot();data['objects']*=2
        with self.assertRaises(ValueError):p.retention_plan(data)

    def test_stale_future_or_unzoned_inventory_is_not_a_current_plan(self):
        now = datetime.now(timezone.utc)
        for collected in [None, '', (now - timedelta(days=2)).isoformat(),
                          (now + timedelta(hours=1)).isoformat(), '2026-09-21T10:00:00']:
            with self.subTest(collected=collected), self.assertRaises(ValueError):
                p.retention_plan({**snapshot(), 'collectedAt': collected})


if __name__ == '__main__':
    unittest.main()
