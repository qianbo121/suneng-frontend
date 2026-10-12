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

class IndependentArchiveObservation(unittest.TestCase):
    def setUp(self):
        self.version = {'role':'previous','sourceCommit':'a'*40,'runtimeImage':'sha256:'+'b'*64,
            'archiveSha256':'c'*64,'archiveBytes':10,'rootFsDiffIds':['sha256:'+'d'*64]}
        self.proof = {'passed':True,'completeArchiveAndAllLayerPayloadsVerified':True,
            'completeGzipEofVerified':True,'serverImported':False,'productionSwitched':False,
            'sourceCommit':self.version['sourceCommit'],'archiveSha256':self.version['archiveSha256'],
            'archiveBytes':10,'scanStats':{'rawArchiveBytesHashed':10},
            'checkedAtUtc':'2026-10-12T15:01:00+00:00',
            'imageIdentity':{'ociRuntimeManifestDigest':self.version['runtimeImage'],
                'configSource':self.version['sourceCommit'],'rootFsDiffIds':self.version['rootFsDiffIds'],
                'rootFsDiffIdsMatched':True,'layerBlobChecks':[{'rootFsDiffId':self.version['rootFsDiffIds'][0],'passed':True}]}}
        self.report = {'kind':'complete-independent-program-archive-observation','algorithmSha256':'e'*64,
            'checks':{'current':{},'previous':self.proof}}

    def check(self):
        return recovery.independent_archive_check(self.version,self.report,'2026-10-12T15:00:00+00:00','e'*64)

    def test_pass_keeps_read_location_explicit_and_requires_native_check(self):
        result=self.check()
        self.assertEqual(result['archiveReadLocation'],'independent-release-host')
        self.assertFalse(result['serverArchiveRead'])
        self.assertTrue(result['serverNativeImageStillRequiresVerification'])

    def test_pre_switch_observation_refused(self):
        self.proof['checkedAtUtc']='2026-10-12T14:59:00+00:00'
        with self.assertRaisesRegex(ValueError,'fresh-post-switch'):
            self.check()

    def test_changed_algorithm_refused(self):
        self.report['algorithmSha256']='f'*64
        with self.assertRaisesRegex(ValueError,'bound-independent'):
            self.check()

    def test_missing_layer_refused(self):
        self.proof['imageIdentity']['layerBlobChecks']=[]
        with self.assertRaisesRegex(ValueError,'all-layers'):
            self.check()

    def test_incomplete_read_refused(self):
        self.proof['scanStats']['rawArchiveBytesHashed']=9
        with self.assertRaisesRegex(ValueError,'identity-mismatch'):
            self.check()

    def test_wrong_runtime_image_refused(self):
        self.proof['imageIdentity']['ociRuntimeManifestDigest']='sha256:'+'f'*64
        with self.assertRaisesRegex(ValueError,'all-layers'):
            self.check()


if __name__ == '__main__':
    unittest.main()
