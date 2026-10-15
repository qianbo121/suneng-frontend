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

class RecoveryInputPreparation(unittest.TestCase):
    def setUp(self):
        import json
        from unittest.mock import patch
        from test_preparation_guard import container
        from test_release_retention import metadata, ident, source
        self.json, self.ident, self.source = json, ident, source
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.live, self.records = self.root/'live', self.root/'records'
        self.current, self.previous = self.records/'current', self.records/'previous'
        for p in (self.live, self.current, self.previous): p.mkdir(parents=True)
        self.tools = Path(recovery.__file__).resolve().parent
        self.lock = self.root/'lock'
        self.lock.touch()
        self.patch = patch.object(recovery, 'deployment_lock', lambda check: self.lock.open('rb'))
        self.patch.start()
        self.addCleanup(self.patch.stop)
        self.row = container()
        self.row['Image'] = ident(3)
        self.row['Config']['Labels']['org.opencontainers.image.revision'] = source(3)
        self.active = 'events {}\nhttp {}\n'
        self.changed = False
        self.current_receipt = {'images': {'frontend':ident(3),'backend':ident(5),'admin':ident(7)},
            'frontendRelease':metadata(3,2),'backendRelease':metadata(5,4),'adminRelease':metadata(7,6),
            'deploymentStatus':'verified','previousReceipt':str(self.current/'previous.json'),
            'releaseOperationReceipt':str(self.current/'operation.json')}
        self.write(self.live/'RELEASE_ARTIFACTS.json', self.current_receipt)
        self.write(self.current/'previous.json', {'frontendRelease':metadata(2,1)})
        self.write(self.current/'operation.json', {'kind':'deploy','passed':True,'applied':True,
            'components':['frontend'],'retention':{'plan':str(self.current/'plan.json')}})
        self.write(self.current/'plan.json', {'components':['frontend'],
            'receiptSha256':self.sha(self.live/'RELEASE_ARTIFACTS.json'),
            'previousReceiptSha256':self.sha(self.current/'previous.json'),
            'operationReceipt':str(self.current/'operation.json'),
            'previousReceipt':str(self.current/'previous.json')})
        for name in ('verified-images.override.yml','DEPLOY_COMMIT','.env.production',
                     'docker-compose.prod.yml','nginx.prod.conf.template'):
            (self.live/name).write_text('private configuration\n')
        for batch,n in ((self.current,3),(self.previous,2)):
            folder=batch/'artifacts/frontend';folder.mkdir(parents=True)
            (folder/'frontend.tar.gz').write_bytes(b'archive')
            self.write(folder/'candidate.json', {'sourceCommit':source(n),'archiveBytes':7,
                'archiveSha256':self.sha(folder/'frontend.tar.gz'),'rootFsDiffIds':[ident(n+100)]})
        report=self.current/'browser/production-browser-report.json';report.parent.mkdir()
        self.write(report, {'passed':True,'phase':'production','sourceCommit':source(3)})
        self.config={'schemaVersion':1,'sourceCommit':source(3),'previousSourceCommit':source(2),
            'currentBatchRoot':str(self.current),'previousBatchRoot':str(self.previous),
            'toolsPins':{p.name:self.sha(p) for p in self.tools.glob('*.py')}}
        self.config_path=self.current/'prepare.json'
        self.output=self.current/'fresh-input.json'
        self.write(self.config_path,self.config)

    def sha(self,p):return hashlib.sha256(p.read_bytes()).hexdigest()
    def write(self,p,v):p.write_text(self.json.dumps(v)+'\n')
    def command(self,args):
        if args in (['docker','ps','-q'],['docker','ps','-aq']):return self.row['Id']+'\n'
        if args[:2]==['docker','inspect']:return self.json.dumps([self.row])
        if args[:3]==['docker','image','inspect']:
            if self.changed:(self.live/'.env.production').write_text('changed\n')
            return self.json.dumps([{'Id':self.ident(n),'Config':{'Labels':{
                'org.opencontainers.image.revision':self.source(n)}},'RootFS':{'Layers':[self.ident(n+100)]}}
                for n in range(2,8)])
        if args[:3]==['docker','exec','corp-site-nginx']:return self.active
        raise AssertionError(args)
    def prepare(self):
        return recovery.prepare_input(self.config_path,self.sha(self.config_path),self.tools,
            self.records,self.output,live=self.live,command=self.command)

    def test_real_command_preserves_crlf_and_surrounding_whitespace(self):
        import sys
        value=recovery.command_output([sys.executable,'-c',"import sys;sys.stdout.buffer.write(b'  x\\r\\n\\n')"])
        self.assertEqual(value,'  x\r\n\n')

    def test_collected_input_matches_guard_and_never_claims_verification(self):
        import preparation_guard as guard
        result=self.prepare();value=self.json.loads(self.output.read_text())
        observed=guard.snapshot(self.live,self.command,[self.live/'.env.production.private'])
        guard.compare(value['baseline']['snapshot'],observed)
        self.assertEqual(value['baseline']['snapshot']['activeNginxSha256'],
                         hashlib.sha256(self.active.encode()).hexdigest())
        self.assertNotEqual(value['baseline']['snapshot']['activeNginxSha256'],
                            hashlib.sha256(self.active.strip().encode()).hexdigest())
        self.assertFalse(result['recoveryVerified']);self.assertFalse(result['releaseAccepted'])
        self.assertFalse(value['futureServerPassed']);self.assertFalse(value['futureReleaseAccepted'])
        self.assertNotIn('private configuration',self.output.read_text())
        self.assertEqual(self.output.stat().st_mode & 0o777,0o600)

    def test_existing_observation_preserved(self):
        self.output.write_text('previous failure evidence')
        with self.assertRaisesRegex(ValueError,'existing-output-preserved'):self.prepare()
        self.assertEqual(self.output.read_text(),'previous failure evidence')

    def test_output_outside_batch_refused(self):
        self.output=self.previous/'new.json'
        with self.assertRaisesRegex(ValueError,'output-inside-current'):self.prepare()
        self.assertFalse(self.output.exists())

    def test_untrusted_external_input_refused_before_output(self):
        with self.assertRaisesRegex(ValueError,'complete-sha-mismatch'):
            recovery.prepare_input(self.config_path,'f'*64,self.tools,self.records,self.output,
                                   live=self.live,command=self.command)
        self.assertFalse(self.output.exists())

    def test_changed_tool_pin_refused(self):
        self.config['toolsPins']['preparation_guard.py']='f'*64
        self.write(self.config_path,self.config)
        with self.assertRaisesRegex(ValueError,'complete-sha-mismatch'):self.prepare()
        self.assertFalse(self.output.exists())

    def test_incorrect_current_source_refused(self):
        self.config['sourceCommit']=self.source(99);self.write(self.config_path,self.config)
        with self.assertRaisesRegex(ValueError,'current-source-mismatch'):self.prepare()
        self.assertFalse(self.output.exists())

    def test_incomplete_tool_pins_refused(self):
        self.config['toolsPins'].pop('preparation_guard.py');self.write(self.config_path,self.config)
        with self.assertRaisesRegex(ValueError,'complete-bound-tool-set'):self.prepare()

    def test_configuration_change_during_collection_refused(self):
        from preparation_guard import ProtectionChanged
        self.changed=True
        with self.assertRaises(ProtectionChanged):self.prepare()
        self.assertFalse(self.output.exists())

    def test_symlink_output_refused(self):
        self.output.symlink_to(self.previous/'other.json')
        with self.assertRaisesRegex(ValueError,'existing-output-preserved'):self.prepare()
        self.assertFalse((self.previous/'other.json').exists())

    def test_deployment_hold_refused(self):
        from preparation_guard import ProtectionChanged
        (self.live/'.DO_NOT_DEPLOY').write_text('hold')
        with self.assertRaises(ProtectionChanged):self.prepare()
        self.assertFalse(self.output.exists())

    def test_unhealthy_service_refused(self):
        from preparation_guard import ProtectionChanged
        self.row['State']['Health']['Status']='unhealthy'
        with self.assertRaises(ProtectionChanged):self.prepare()
        self.assertFalse(self.output.exists())


if __name__ == '__main__':
    unittest.main()
