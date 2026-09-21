from datetime import datetime, timedelta, timezone
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
