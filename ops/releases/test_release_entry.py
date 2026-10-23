"""Offline synthetic integration; no Docker, SSH, business submission or deployment."""
import contextlib
import copy
import io
import json
from pathlib import Path
import tempfile
import tarfile
import unittest
from unittest.mock import patch

import browser_capture_guard as guard
import phase_runtime
import release_contract
import release_entry as entry
import run_browser_checks
import test_archive_identity as archives
import test_release_browser as browsers
from test_release_contract import recovery_input, recovery_report


class EntryFixture:
    def __init__(self, root):
        self.root = root
        self.archive = archives.Fixture(root)
        candidate = json.loads(self.archive.candidate.read_text())
        self.image = self.archive.runtime; self.source = archives.SOURCE
        with patch.multiple(browsers, SOURCE=self.source, IMAGE=self.image):
            self.browser = browsers.SyntheticFixture(root)
            self.candidate_name, self.candidate_report = self.browser.base_report('candidate')
        self.config = {'schemaVersion': 1, 'root': str(root), 'sourceCommit': self.source,
                       'components': ['frontend'], 'inputs': {}}
        self.config_file = root/'entry-config.json'
        for name, path in [('candidate', 'candidate.json'), ('archive', 'frontend.tar.gz'),
                           ('plan', 'plan.json'), ('candidateReport', self.candidate_name),
                           ('productionReport', self.browser.base_name),
                           ('interactionReport', self.browser.interaction_name)]: self.bind(name, path)
        self.write('manifest', 'manifest.json', {'sourceCommit': self.source, 'image': self.image})
        self.write('preparationBaseline', 'preparation-baseline.json',
                   {'schemaVersion': 1, 'manifestSha256': 'd'*64, 'live': '/synthetic',
                    'snapshot': {'containers': {'synthetic': {}}}})
        value = recovery_input(self.source)
        value['expectedCurrentImages']['frontend'] = self.image
        value['frontendVersions'][0].update(runtimeImage=self.image,
            archiveSha256=candidate['archiveSha256'], archiveBytes=candidate['archiveBytes'])
        self.write('recoveryInput', 'recovery-input.json', value)
        self.write('recoveryReport', 'recovery-report.json', recovery_report(value,
                   self.config['inputs']['recoveryInput']['sha256']))
        self.save()

    def bind(self, name, relative):
        self.config['inputs'][name] = {'path': relative, 'sha256': guard.digest(self.root/relative)}

    def write(self, name, relative, value):
        path=self.root/relative; path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value)); self.bind(name, relative)

    def save(self):
        self.config_file.write_text(json.dumps(self.config)); return self.open()

    def open(self): return entry.Entry(self.config_file, guard.digest(self.config_file))


def native_success(args):
    print(json.dumps({'passed': True, 'applied': '--apply' in args})); return None


class EntryTest(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.fixture=EntryFixture(Path(self.tmp.name).resolve())

    def start_candidate(self):
        e=self.fixture.open();e.run('archive');e.run('candidate');return e

    def activate(self, e):
        with patch('frontend_release.main', side_effect=native_success) as action:
            e.run('preflight'); e.run('apply', apply=True)
            self.assertEqual(action.call_count, 2)

    def test_check_and_status_are_read_only_and_default_frontend(self):
        f=self.fixture;f.config.pop('components');e=f.save()
        self.assertTrue(e.checked('candidate')['inputComplete'])
        self.assertFalse(e.status()['applyAttempted']);self.assertFalse((f.root/'entry').exists())

    def test_real_archive_and_bound_synthetic_browser_gates_run(self):
        e=self.start_candidate()
        self.assertEqual(e.status()['steps']['candidate']['attempts'][-1]['status'], 'succeeded')
        self.assertFalse(e.status()['releaseAccepted'])

    def test_unrelated_evidence_append_keeps_running_inputs_and_succeeds(self):
        f=self.fixture
        roles=('productionReport', 'interactionReport', 'recoveryInput', 'recoveryReport')
        added={name:f.config['inputs'].pop(name) for name in roles}
        e=f.save(); original=copy.deepcopy(e.config)
        verify=entry.archive_identity.verify_archive
        def append_evidence(*args, **kwargs):
            f.config['inputs'].update(added);f.save()
            return verify(*args, **kwargs)
        with patch.object(entry.archive_identity, 'verify_archive', side_effect=append_evidence):
            result=e.run('archive')
        snapshot=result['configSnapshot']
        self.assertEqual(release_contract.read_bound(f.root/snapshot['path'], snapshot['sha256']), original)
        self.assertNotEqual(f.open().config, original)
        self.assertEqual(e.status()['steps']['archive']['attempts'][-1]['status'], 'succeeded')

    def test_running_release_or_step_config_changes_still_fail(self):
        changes={
            'source': lambda c:c.update(sourceCommit='f'*40),
            'module': lambda c:c.update(components=['backend']),
            'destination': lambda c:c.update(live='/different-live'),
            'archive': lambda c:c['inputs']['archive'].update(sha256='f'*64),
            'plan': lambda c:c['inputs']['plan'].update(sha256='f'*64),
        }
        verify=entry.archive_identity.verify_archive
        for name, change in changes.items():
            with self.subTest(name=name):
                root=self.fixture.root/name;root.mkdir();f=EntryFixture(root);e=f.open()
                def replace_config(*args, **kwargs):
                    change(f.config);f.config_file.write_text(json.dumps(f.config))
                    return verify(*args, **kwargs)
                with patch.object(entry.archive_identity, 'verify_archive', side_effect=replace_config):
                    with self.assertRaises(release_contract.ContractError):e.run('archive')
                self.assertEqual(e.status()['steps']['archive']['attempts'][-1]['status'], 'failed')
                self.assertFalse(list(e.stage_directory('archive').glob('attempt-*/result.json')))

    def test_running_input_file_change_still_fails(self):
        f=self.fixture;e=f.open();verify=entry.archive_identity.verify_archive
        def change_input(*args, **kwargs):
            result=verify(*args, **kwargs)
            (f.root/'candidate.json').write_text('{}')
            return result
        with patch.object(entry.archive_identity, 'verify_archive', side_effect=change_input):
            with self.assertRaisesRegex(release_contract.ContractError, 'digest-mismatch'):
                e.run('archive')
        self.assertEqual(e.status()['steps']['archive']['attempts'][-1]['status'], 'failed')

    def test_running_snapshot_change_still_fails(self):
        f=self.fixture;e=f.open();verify=entry.archive_identity.verify_archive
        def change_snapshot(*args, **kwargs):
            result=verify(*args, **kwargs)
            snapshot=next(e.stage_directory('archive').glob('attempt-*/entry-config.json'))
            snapshot.write_text('{}')
            return result
        with patch.object(entry.archive_identity, 'verify_archive', side_effect=change_snapshot):
            with self.assertRaisesRegex(release_contract.ContractError, 'digest-mismatch'):
                e.run('archive')
        self.assertFalse(list(e.stage_directory('archive').glob('attempt-*/result.json')))

    def test_running_step_report_replacement_still_fails(self):
        f=self.fixture;e=f.open();e.run('archive');browser=e._browser
        def replace_report(phase):
            result=browser(phase)
            f.config['inputs']['candidateReport']=f.config['inputs']['productionReport']
            f.save()
            return result
        with patch.object(e, '_browser', side_effect=replace_report):
            with self.assertRaisesRegex(release_contract.ContractError, 'config-changed-during-step'):
                e.run('candidate')
        self.assertEqual(e.status()['steps']['candidate']['attempts'][-1]['status'], 'failed')

    def test_missing_recovery_input_fails_before_creating_state(self):
        f=self.fixture;v=json.loads((f.root/'recovery-input.json').read_text());v.pop('baseline')
        f.write('recoveryInput','recovery-input.json',v);e=f.save()
        with self.assertRaisesRegex(release_contract.ContractError, 'baseline'):e.run('recovery-input')
        self.assertFalse((f.root/'entry').exists())

    def test_source_image_scope_and_unknown_options_are_rejected(self):
        f=self.fixture
        for value in (['backend'], ['frontend','admin']):
            f.config['components']=value
            with self.assertRaises(release_contract.ContractError):f.save()
        f.config['components']=['frontend'];f.config['arbitraryCommand']='echo injected'
        with self.assertRaises(release_contract.ContractError):f.save()

    def test_dependency_failure_and_unapproved_apply_do_not_execute_native(self):
        e=self.fixture.open()
        with patch('frontend_release.main') as action:
            with self.assertRaises(release_contract.ContractError):e.run('preflight')
            with self.assertRaises(release_contract.ContractError):e.run('apply')
            action.assert_not_called()

    def test_preflight_failure_keeps_failure_and_explicit_resume(self):
        e=self.start_candidate()
        def fail(args):
            print('retained synthetic diagnostic');raise TimeoutError('synthetic timeout')
        with patch('frontend_release.main',side_effect=fail):
            with self.assertRaises(TimeoutError):e.run('preflight')
        state=e.status()['steps']['preflight'];self.assertEqual(state['attempts'][-1]['status'],'failed')
        self.assertEqual(state['attempts'][-1]['failureCategory'],'timeout')
        original_snapshot=next(e.stage_directory('preflight').glob('attempt-*/entry-config.json'))
        original_bytes=original_snapshot.read_bytes()
        with patch('frontend_release.main',side_effect=native_success):
            with self.assertRaises(phase_runtime.ResumeRefused):e.run('preflight')
            e.run('preflight',resume=True)
        state=e.status()['steps']['preflight'];self.assertEqual(len(state['attempts']),2)
        self.assertTrue(list(e.stage_directory('preflight').glob('attempt-*/native-output.json')))
        self.assertEqual(len(list(e.stage_directory('preflight').glob('attempt-*/entry-config.json'))),2)
        self.assertEqual(original_snapshot.read_bytes(),original_bytes)

    def test_apply_cannot_replay_after_success_failure_or_interruption(self):
        e=self.start_candidate()
        with patch('frontend_release.main',side_effect=native_success):e.run('preflight')
        def fail(args):raise TimeoutError('synthetic apply interruption')
        with patch('frontend_release.main',side_effect=fail):
            with self.assertRaises(TimeoutError):e.run('apply',apply=True)
        self.assertTrue(e.status()['reconciliationRequired'])
        with patch('frontend_release.main') as action:
            with self.assertRaises(phase_runtime.ResumeRefused):e.run('apply',apply=True)
            with self.assertRaises(release_contract.ContractError):e.run('apply',apply=True,resume=True)
            action.assert_not_called()

    def test_captures_older_than_apply_are_rejected(self):
        e=self.start_candidate();self.activate(e)
        with self.assertRaisesRegex(release_contract.ContractError,'predate'):e.run('production')

    def test_complete_synthetic_flow_and_pack_do_not_claim_actual_acceptance(self):
        with patch.object(phase_runtime,'now',return_value='2026-10-10T11:59:30+00:00'):
            e=self.start_candidate();self.activate(e)
            e.run('production');e.run('recovery-input');e.run('recovery');r=e.run('pack')
        self.assertTrue(r['passed']);self.assertFalse(r['releaseAccepted'])
        bundles = list(e.stage_directory('pack').glob('attempt-*/browser-evidence.tar.gz'))
        self.assertEqual(len(bundles), 1)
        with tarfile.open(bundles[0], 'r:gz') as bundle:
            for report in (self.fixture.candidate_report, self.fixture.browser.base):
                for row in report['records']:
                    self.assertEqual(bundle.getmember(row['consoleFile']).size, 0)
        with patch('frontend_release.main') as action:
            with self.assertRaises(phase_runtime.ResumeRefused):e.run('apply',apply=True)
            action.assert_not_called()

    def test_source_metadata_change_cannot_reuse_previous_batch(self):
        e=self.start_candidate();f=self.fixture
        f.config['live']=str(f.root)
        changed=f.save()
        with self.assertRaisesRegex(release_contract.ContractError,'release-identity-changed'):
            changed.run('archive',resume=True)

    def test_no_symlink_state_and_no_candidate_result_tampering(self):
        f=self.fixture;outside=f.root/'outside';outside.mkdir();(f.root/'entry').symlink_to(outside)
        with self.assertRaises(release_contract.ContractError):f.open().run('archive')
        (f.root/'entry').unlink();e=self.start_candidate()
        (f.root/f.candidate_name).write_text('{}')
        with self.assertRaisesRegex(release_contract.ContractError,'digest-mismatch'):e.checked('candidate')

    def test_focused_summary_rejects_skips_retries_and_expected_failures(self):
        tests=[{'expectedStatus':'passed','status':'expected','results':[{'status':'passed'}]} for _ in range(12)]
        data={'stats':{'expected':12,'unexpected':0,'flaky':0,'skipped':0},'errors':[],
              'suites':[{'specs':[{'tests':tests}]}]}
        self.assertTrue(run_browser_checks.validate_result(data)['passed'])
        for key in ('skipped','unexpected','flaky'):
            bad=copy.deepcopy(data);bad['stats'][key]=1
            with self.assertRaises(release_contract.ContractError):run_browser_checks.validate_result(bad)
        bad=copy.deepcopy(data);bad['suites'][0]['specs'][0]['tests'][0]['results'].append({'status':'passed'})
        with self.assertRaises(release_contract.ContractError):run_browser_checks.validate_result(bad)


if __name__ == '__main__':unittest.main()
