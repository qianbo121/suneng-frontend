"""Synthetic unit fixtures only: these are never real-browser acceptance evidence.

The protocol's required 'real-browser' literal is deliberately exercised using
labelled synthetic records, identities and generated PNGs. No browser, network,
production service, contact or deployment is executed by this test file.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
import random
import stat
import struct
import tarfile
import tempfile
import unittest
from functools import lru_cache
from unittest.mock import patch
import zlib

import release_browser as b

SOURCE = 'b' * 40
IMAGE = 'sha256:' + 'c' * 64
BEFORE = '2026-10-10T12:00:00+00:00'
CAPTURE = '2026-10-10T12:00:05+00:00'
AFTER = '2026-10-10T12:00:10+00:00'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


@lru_cache(maxsize=2)
def synthetic_png(width, height):
    def chunk(kind, raw):
        return struct.pack('>I', len(raw)) + kind + raw + struct.pack('>I', zlib.crc32(kind + raw))
    rows = (b'\x00' + b'\x30\x60\x90' * width) * height
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
            + chunk(b'tEXt', b'Synthetic\x00' + b'UNIT TEST ONLY ' * 100)
            + chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND', b''))


class SyntheticFixture:
    """Complete on-disk 20-view and 8-task synthetic positive fixture."""
    def __init__(self, root):
        self.root = root
        self.contract = {}
        for name in sorted(b.HOMES):
            viewport = {'width': 390, 'height': 844} if name.endswith('mobile') else {'width': 1440, 'height': 900}
            self.contract[name] = {'path': '/zh' if name.startswith('home-zh-') else '/en',
                                   'query': {}, 'viewport': viewport, 'assertions': ['visible', 'qaSessionMatches']}
        for number in range(16):
            self.contract[f'page-{number}'] = {'path': f'/zh/synthetic-{number}', 'query': {},
                                              'viewport': {'width': 1440, 'height': 900},
                                              'assertions': ['visible', 'qaSessionMatches']}
        self.write('browser/browserContract.json', self.contract)
        self.plan = {'syntheticFixture': True, 'sourceCommit': SOURCE, 'runtimeImage': IMAGE,
                     'qaMarker': 'synthetic_qa', 'browserContract': self.contract,
                     'browserContractSha256': self.digest('browser/browserContract.json'),
                     'uiContainerName': 'synthetic-ui', 'uiContainerLabel': 'synthetic-owned-ui'}
        self.write('plan.json', self.plan)
        self.plan_sha = self.digest('plan.json')
        self.write('browser/collector.py', b'# SYNTHETIC UNIT FIXTURE; not a browser collector\n')
        self.write('browser/capture-interactions.py', b'# SYNTHETIC UNIT FIXTURE; not a browser collector\n')
        self.base_name, self.base = self.base_report('production')
        self.interaction_name, self.interactions = self.interaction_report()

    def write(self, name, value):
        raw = value if isinstance(value, bytes) else json.dumps(value).encode()
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(raw)
        return name

    def digest(self, name):
        return sha((self.root / name).read_bytes())

    def bound(self, names):
        return {name: self.digest(name) for name in names}

    def identities(self, phase):
        candidate = phase == 'candidate'
        container = {'id': 'a' * 64, 'source': SOURCE, 'image': IMAGE, 'running': True,
                     'health': 'healthy', 'name': '/synthetic-ui' if candidate else '/corp-site-frontend'}
        if candidate:
            container.update(label='synthetic-owned-ui', ports={'3000/tcp': [{'HostIp': '127.0.0.1', 'HostPort': '52995'}]})
        names = []
        for side, time in [('before', BEFORE), ('after', AFTER)]:
            raw = self.write(f'browser/{phase}/raw-{side}.json', container)
            identity = {'syntheticFixture': True, 'container': container, 'readOnly': True,
                        'rawIdentityFile': raw, 'checkedAtUtc': time,
                        'baseUrl': 'http://127.0.0.1:65219' if candidate else 'https://www.jssngyl.cn'}
            if candidate:
                identity['tunnel'] = {'server': 'suneng-ecs-prod', 'sourceCommit': SOURCE,
                                      'sshSessionId': 'synthetic-session', 'localPort': 65219, 'remotePort': 52995}
            name = self.write(f'browser/{phase}/identity-{side}.json', identity)
            names.extend([name, raw])
        return names

    def base_report(self, phase, preview=False):
        names = self.identities(phase) + ['browser/collector.py']
        contract = b.preview_contract(self.contract) if preview else self.contract
        records = []
        for key, spec in contract.items():
            prefix = f'browser/{phase}/views/{key}/'
            home_preview = preview and key in b.HOMES
            hostname = '127.0.0.1' if phase == 'candidate' else 'www.jssngyl.cn'
            origin = 'http://127.0.0.1:65219' if phase == 'candidate' else 'https://www.jssngyl.cn'
            qa = {'hostname': hostname, 'sessionId': None if home_preview else 'synthetic-session',
                  'qaSession': None if home_preview else 'synthetic-session',
                  'localPreviewTrackingSuppressed': home_preview,
                  'keys': ['suneng_session_id', 'suneng_manual_qa_session_v1']}
            observed = {'syntheticFixture': True, 'method': 'real-browser', 'viewport': spec['viewport'],
                        'rendered': True, 'overflow': False, 'at': CAPTURE,
                        'url': origin + spec['path'] + '?acquisition_qa=synthetic_qa',
                        'qaSessionMatches': not home_preview, 'localPreviewTrackingSuppressed': home_preview,
                        'assertions': {name: True for name in spec['assertions']}, 'observations': {'qa': qa}}
            record = self.write(prefix + 'record.json', observed)
            png = self.write(prefix + 'capture.png', synthetic_png(**spec['viewport']))
            console = self.write(prefix + 'console.log', b'')
            errors = self.write(prefix + 'errors.log', b'')
            names.extend([record, png, console, errors])
            records.append({'case': key, 'recordFile': record, 'screenshot': png,
                            'consoleFile': console, 'errorsFile': errors})
        report = {'syntheticFixture': True, 'passed': True, 'phase': phase, 'sourceCommit': SOURCE,
                  'method': 'real-browser', 'planSha256': self.plan_sha,
                  'contactClicked': False, 'formSubmitted': False, 'actualCaseCount': 20,
                  'collectorFiles': ['browser/collector.py'], 'identityBefore': names[0],
                  'identityAfter': names[2], 'records': records, 'boundFilesSha256': self.bound(names)}
        if phase == 'candidate':
            report['acceptedContainerId'] = 'a' * 64
        name = f'browser/{phase}-report.json'
        self.write(name, report)
        return name, report

    def interaction_report(self):
        names = self.identities('production') + ['browser/capture-interactions.py']
        rows, states_total, arrivals_total = [], 0, 0
        for key, spec in b.DEFAULT_INTERACTIONS.items():
            view, task = key.split('/')
            prefix = f'browser/production/tasks/{view}-{task}/'
            files, states = [], []
            for number in range(spec['states']):
                record = f'state-{number}.json';png = f'state-{number}.png'
                width, height = spec['viewport']
                observed = {'syntheticFixture': True, 'at': CAPTURE, 'url': 'https://www.jssngyl.cn/zh',
                            'assertions': {'qaSessionMatches': True, 'taskObserved': True},
                            'observed': {'qaAssociation': {'hostname': 'www.jssngyl.cn',
                                         'sessionId': 'synthetic-session', 'qa': 'synthetic-session'},
                                         'viewport': {'width': width, 'height': height}}}
                files.extend([self.write(prefix + record, observed), self.write(prefix + png, synthetic_png(width, height))])
                states.append({'record': record, 'screenshot': png})
            files.extend([self.write(prefix + 'console.raw.json', {'data': {'messages': []}}),
                          self.write(prefix + 'errors.raw.json', {'data': {'errors': []}})])
            receipt = {'syntheticFixture': True, 'passed': True, 'method': 'real-browser', 'phase': 'production',
                       'sourceCommit': SOURCE, 'runtimeImage': IMAGE, 'planSha256': self.plan_sha,
                       'task': task, 'viewport': spec['viewport'], 'atUtc': CAPTURE,
                       'formSubmitted': False, 'leadFormSubmitted': False, 'externalContactActivated': False,
                       'contactClicked': task == 'contacts', 'contactDialogOpened': task == 'contacts',
                       'collectorSourceSha256': self.digest('browser/capture-interactions.py'),
                       'boundFilesSha256': {Path(n).name: self.digest(n) for n in files},
                       'consoleMessageCount': 0, 'runtimeErrorCount': 0, 'states': states,
                       'actualNavigationArrivals': [f'/zh/synthetic-{n}' for n in range(spec['arrivals'])]}
            name = self.write(prefix + 'receipt.json', receipt)
            names.extend(files + [name])
            rows.append({'viewport': view, 'task': task, 'passed': True, 'checks': {'observed': True},
                         'receipt': name, 'actualStateCount': spec['states'], 'actualNavigationCount': spec['arrivals']})
            states_total += spec['states'];arrivals_total += spec['arrivals']
        report = {'syntheticFixture': True, 'passed': True, 'method': 'real-browser', 'phase': 'production',
                  'sourceCommit': SOURCE, 'runtimeImage': IMAGE, 'planSha256': self.plan_sha,
                  'externalContactActivated': False, 'formSubmitted': False, 'contactDialogOpened': True,
                  'identityChecks': {name: True for name in ['actualSameContainer', 'actualSameOrigin',
                      'actualSourceMatches', 'actualImageMatches', 'actualRunningHealthy',
                      'readOnlyIdentities', 'orderedIdentityWindow']},
                  'identityBefore': names[0], 'identityAfter': names[2], 'reports': rows,
                  'actualTaskCount': 8, 'actualStateCount': states_total, 'actualNavigationCount': arrivals_total,
                  'boundFilesSha256': self.bound(names)}
        name = self.write('browser/interaction-report.json', report)
        return name, report

    def interaction_check(self):
        self.write(self.interaction_name, self.interactions)
        return b.validate_interactions(self.root, self.interaction_name, plan_sha256=self.plan_sha,
                                       report_sha256=self.digest(self.interaction_name))

    def change_receipt(self, row, receipt):
        self.write(row['receipt'], receipt)
        self.interactions['boundFilesSha256'][row['receipt']] = self.digest(row['receipt'])


class BrowserValidationTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.fixture = SyntheticFixture(Path(self.temp.name).resolve())

    def test_complete_synthetic_production_fixture_passes_without_mocking_guards(self):
        f = self.fixture
        report = b.validate(f.root, f.base_name, 'production', plan_sha256=f.plan_sha,
                            report_sha256=f.digest(f.base_name))
        self.assertEqual(report['actualCaseCount'], 20)
        interactions = f.interaction_check()
        self.assertEqual((interactions['actualTaskCount'], interactions['actualStateCount'],
                          interactions['actualNavigationCount']), (8, 34, 12))
        self.assertTrue(interactions['syntheticFixture'])

    def test_production_never_accepts_preview_exception(self):
        f = self.fixture
        with self.assertRaisesRegex(RuntimeError, 'preview-exception'):
            b.validate(f.root, f.base_name, 'production', plan_sha256=f.plan_sha,
                       report_sha256=f.digest(f.base_name), preview_sha256='a'*64)

    def test_exact_four_home_candidate_preview_passes_and_wider_exception_is_rejected(self):
        f = self.fixture
        name, report = f.base_report('candidate', preview=True)
        diagnostic = f.write('browser/preview-diagnostic.json', {'syntheticFixture': True, 'suppressed': True})
        declaration = {'sourceCommit': SOURCE, 'originalPlanSha256': f.plan_sha,
                       'originalContractSha256': f.plan['browserContractSha256'],
                       'previewContract': b.preview_contract(f.contract),
                       'diagnosticFilesSha256': f.bound([diagnostic])}
        declaration_name = f.write('browser/candidate-preview-contract.json', declaration)
        def validate():
            preview_sha = f.digest(declaration_name)
            report['candidatePreviewContractSha256'] = preview_sha;f.write(name, report)
            return b.validate(f.root, name, 'candidate', plan_sha256=f.plan_sha,
                              report_sha256=f.digest(name), preview_sha256=preview_sha)
        self.assertTrue(validate()['passed'])
        declaration['previewContract']['page-0']['assertions'] = ['visible']
        f.write(declaration_name, declaration)
        with self.assertRaisesRegex(RuntimeError, 'only-four-home'):
            validate()

    def test_raw_console_and_error_bindings_are_mandatory(self):
        f = self.fixture;row = next(r for r in f.interactions['reports'] if r['task'] == 'contacts')
        original = json.loads((f.root / row['receipt']).read_bytes())
        for log in ('console.raw.json', 'errors.raw.json'):
            with self.subTest(log=log):
                receipt = copy.deepcopy(original);receipt['boundFilesSha256'].pop(log)
                f.change_receipt(row, receipt)
                with self.assertRaises(RuntimeError):f.interaction_check()

    def test_contacts_must_really_open_dialog_and_other_tasks_must_not(self):
        f = self.fixture
        for contact in (True, False):
            row = next(r for r in f.interactions['reports'] if (r['task'] == 'contacts') == contact)
            original = json.loads((f.root / row['receipt']).read_bytes())
            for field in ('contactClicked', 'contactDialogOpened'):
                with self.subTest(task=row['task'], field=field):
                    receipt = copy.deepcopy(original);receipt[field] = not contact
                    f.change_receipt(row, receipt)
                    with self.assertRaises(RuntimeError):f.interaction_check()
            f.change_receipt(row, original)

    def test_summary_contact_and_identity_checks_cannot_be_missing_or_false(self):
        f = self.fixture;original = copy.deepcopy(f.interactions)
        for field in ('contactDialogOpened', 'identityChecks'):
            with self.subTest(field=field):
                f.interactions = copy.deepcopy(original);f.interactions.pop(field)
                with self.assertRaises(RuntimeError):f.interaction_check()
        f.interactions = copy.deepcopy(original)
        f.interactions['identityChecks']['actualSameContainer'] = False
        with self.assertRaises(RuntimeError):f.interaction_check()

    def test_raw_identity_and_collector_binding_are_mandatory(self):
        f = self.fixture;original = copy.deepcopy(f.interactions['boundFilesSha256'])
        for name in ('browser/production/raw-before.json', 'browser/capture-interactions.py'):
            with self.subTest(name=name):
                f.interactions['boundFilesSha256'] = dict(original);f.interactions['boundFilesSha256'].pop(name)
                with self.assertRaises(RuntimeError):f.interaction_check()

    def test_reviewed_digest_origin_and_state_path_traversal_are_rejected(self):
        f = self.fixture
        with self.assertRaisesRegex(RuntimeError, 'digest-mismatch'):
            b.validate(f.root, f.base_name, 'production', plan_sha256=f.plan_sha, report_sha256='0'*64)
        with self.assertRaisesRegex(RuntimeError, 'relative'):
            b.validate(f.root, '../outside.json', 'production', plan_sha256=f.plan_sha, report_sha256='0'*64)
        record_name = f.base['records'][0]['recordFile']
        observed = json.loads((f.root / record_name).read_bytes())
        observed['url'] = observed['url'].replace('https://www.jssngyl.cn', 'http://127.0.0.1:65219')
        f.write(record_name, observed);f.base['boundFilesSha256'][record_name] = f.digest(record_name)
        f.write(f.base_name, f.base)
        with self.assertRaisesRegex(RuntimeError, 'origin'):
            b.validate(f.root, f.base_name, 'production', plan_sha256=f.plan_sha,
                       report_sha256=f.digest(f.base_name))
        row = f.interactions['reports'][0]
        receipt = json.loads((f.root / row['receipt']).read_bytes())
        receipt['states'][0]['record'] = '../../outside.json';f.change_receipt(row, receipt)
        with self.assertRaises(RuntimeError):f.interaction_check()

    def test_bound_console_warning_is_rejected(self):
        f = self.fixture;row = f.interactions['reports'][0]
        receipt = json.loads((f.root / row['receipt']).read_bytes())
        path = (Path(row['receipt']).parent / 'console.raw.json').as_posix()
        f.write(path, {'data': {'messages': [{'type': 'warning', 'text': 'synthetic warning'}]}})
        receipt['consoleMessageCount'] = 1;receipt['boundFilesSha256']['console.raw.json'] = f.digest(path)
        f.interactions['boundFilesSha256'][path] = f.digest(path);f.change_receipt(row, receipt)
        with self.assertRaisesRegex(RuntimeError, 'console'):
            f.interaction_check()


class BrowserPackTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve();(self.root / 'browser').mkdir()
        self.capture = self.root / 'browser/synthetic.json';self.capture.write_bytes(b'{"syntheticFixture":true}')
        self.console = self.root / 'browser/console.log';self.console.write_bytes(b'')
        self.report = {'boundFilesSha256': {'browser/synthetic.json': sha(self.capture.read_bytes()),
                                          'browser/console.log': sha(b'')}}
        self.output = self.root / 'synthetic-evidence.tar.gz'

    def pack(self):
        return b.pack(self.root, [self.report], self.output)

    def test_bounded_package_keeps_genuine_empty_log_and_private_permissions(self):
        previous_umask = os.umask(0o022)
        try:result = self.pack()
        finally:os.umask(previous_umask)
        self.assertTrue(result['passed']);self.assertEqual(result['fileCount'], 2)
        self.assertEqual(stat.S_IMODE(self.output.stat().st_mode), 0o600)
        with tarfile.open(self.output, 'r:gz') as archive:
            self.assertEqual(archive.extractfile('browser/console.log').read(), b'')
            self.assertTrue(all(row.mode == 0o600 and row.isfile() for row in archive))

    def test_unbound_empty_log_and_empty_placeholder_are_rejected(self):
        self.report['boundFilesSha256'].pop('browser/console.log')
        with self.assertRaisesRegex(RuntimeError, 'empty'):self.pack()
        self.report['boundFilesSha256']['browser/console.log'] = sha(b'')
        (self.root / 'browser/placeholder.json').write_bytes(b'')
        self.report['boundFilesSha256']['browser/placeholder.json'] = sha(b'')
        with self.assertRaisesRegex(RuntimeError, 'empty'):self.pack()
        self.assertFalse(self.output.exists())

    def test_file_count_and_uncompressed_limit_fail_before_output(self):
        for name, value in [('MAX_FILES', 1), ('MAX_BYTES', len(self.capture.read_bytes()) - 1)]:
            with self.subTest(limit=name), patch.object(b, name, value):
                with self.assertRaises(RuntimeError):self.pack()
                self.assertFalse(self.output.exists())

    def test_final_compressed_bundle_must_fit_limit_including_container_overhead(self):
        generator = random.Random(10)
        raw = bytes(generator.getrandbits(8) for _ in range(128 * 1024))
        self.capture.write_bytes(raw);self.report['boundFilesSha256']['browser/synthetic.json'] = sha(raw)
        with patch.object(b, 'MAX_BYTES', len(raw)):
            with self.assertRaises(RuntimeError):self.pack()
        self.assertEqual(self.capture.read_bytes(), raw)

    def test_existing_output_and_symlinked_evidence_are_rejected_without_overwrite(self):
        self.output.write_bytes(b'protected-existing-bundle')
        with self.assertRaises(RuntimeError):self.pack()
        self.assertEqual(self.output.read_bytes(), b'protected-existing-bundle')
        self.output.unlink()
        outside = self.root / 'outside.json';outside.write_bytes(b'{"syntheticFixture":true}')
        (self.root / 'browser/link.json').symlink_to(outside)
        with self.assertRaisesRegex(RuntimeError, 'symlink'):self.pack()


if __name__ == '__main__':
    unittest.main()
