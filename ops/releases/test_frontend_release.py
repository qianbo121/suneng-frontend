import copy
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import threading
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('release', Path(__file__).with_name('frontend_release.py'))
r = importlib.util.module_from_spec(spec)
spec.loader.exec_module(r)
OLD = 'sha256:' + 'a' * 64
NEW = 'sha256:' + 'b' * 64
RECEIPT = {'images': {'frontend': OLD, 'backend': 'sha256:' + 'c' * 64, 'admin': 'sha256:' + 'd' * 64}, 'deploymentStatus': 'verified'}
MANIFEST = {'schemaVersion': 1, 'image': NEW, 'expectedCurrentImage': OLD, 'publicationScope': r.SCOPE,
            'sourceIdentity': 'git-commit', 'sourceCommit': 'e' * 40, 'archiveSha256': 'f' * 64}
GOOD = {'passed': True, 'sitemapPassed': True, 'checks': [], 'caseState': 'open'}
HENAN = 'henan-annealing-solution-line'
CASE_GROUP = ['/zh/case', f'/zh/case/{HENAN}', '/en/case', f'/en/case/{HENAN}']


def sitemap(*paths, alternates=()):
    links = ''.join(f'<xhtml:link rel="alternate" hreflang="x" href="https://example.test{p}"/>' for p in alternates)
    urls = ''.join(f'<url><loc>https://example.test{p}</loc>{links}</url>' for p in paths)
    return ('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
            f'xmlns:xhtml="http://www.w3.org/1999/xhtml">{urls}</urlset>')


def site(statuses, xml):
    """A fake public site: listed paths as given, other live pages 200, everything else 404."""
    def command(args, **kwargs):
        if args[0] != 'curl':
            raise AssertionError(args)
        url = args[-1]
        if url.endswith('/sitemap.xml'):
            return xml
        path = url.removeprefix('https://example.test')
        if path in statuses:
            return str(statuses[path])
        return '200' if path in r.PUBLIC_LIVE else '404'
    return command


def rows(frontend=OLD):
    return [{'Name': '/corp-site-' + name, 'Id': name + (frontend if name == 'frontend' else ''),
             'Image': frontend if name == 'frontend' else RECEIPT['images'].get(name, 'sha256:' + '0' * 64),
             'State': {'Running': True, 'StartedAt': 'unchanged', 'Health': {'Status': 'healthy'}}}
            for name in ['postgres', 'backend', 'admin', 'nginx', 'frontend']]


class ContractTest(unittest.TestCase):
    def test_rejects_mutable_image_missing_identity_or_changed_scope(self):
        for field, value in [('image', 'frontend:latest'), ('sourceCommit', 'main'),
                             ('expectedCurrentImage', ''), ('archiveSha256', ''),
                             ('publicationScope', 'all'), ('sourceIdentity', 'unknown')]:
            with self.subTest(field=field), self.assertRaises(ValueError):
                r.validate_manifest({**MANIFEST, field: value})

    def test_supports_honestly_identified_historical_snapshot(self):
        value = {**MANIFEST, 'sourceIdentity': 'frozen-snapshot', 'sourceManifestSha256': 'a' * 64}
        value.pop('sourceCommit')
        self.assertEqual(r.validate_manifest(value), value)

    def test_rejects_current_version_drift_and_stale_receipt(self):
        with self.assertRaises(RuntimeError):
            r.assert_current(RECEIPT, rows(NEW), OLD)
        wrong = copy.deepcopy(RECEIPT)
        wrong['images']['backend'] = OLD
        with self.assertRaises(RuntimeError):
            r.assert_current(wrong, rows(), OLD)

    def test_route_and_sitemap_failures_never_count_as_success(self):
        contract = r.case_contract('open')
        for value in [{'passed': False, 'sitemapPassed': True, 'caseState': 'open'},
                      {'passed': True, 'sitemapPassed': False, 'caseState': 'open'},
                      {'passed': True, 'sitemapPassed': True, 'caseState': 'either'},
                      {'passed': True, 'sitemapPassed': True}]:
            with self.subTest(value=value), patch.object(r, 'run', return_value=json.dumps(value)), self.assertRaises(RuntimeError):
                r.probe('fixture', 'fixture', contract)

    def test_probe_passes_the_case_contract_to_the_container(self):
        contract = r.case_contract('either')
        with patch.object(r, 'run', return_value=json.dumps({**GOOD, 'caseState': 'either'})) as run:
            r.probe('fixture', 'script', contract)
        args = run.call_args.args[0]
        self.assertEqual(json.loads(args[args.index('-e') + 1].split('=', 1)[1]), contract)

    def test_manifest_case_state_is_explicit(self):
        self.assertEqual(r.validate_manifest({**MANIFEST, 'caseState': 'closed'})['caseState'], 'closed')
        for value in ['either', 'all', '']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                r.validate_manifest({**MANIFEST, 'caseState': value})

    def test_contract_keeps_guides_solutions_and_drafts_private(self):
        for state in ['open', 'closed', 'either']:
            contract = r.case_contract(state)
            self.assertEqual(contract['group'], CASE_GROUP)
            for path in ['/zh/solutions', '/en/solutions', '/zh/articles/gongye-lu-baojia-canshu', *r.DRAFT_CASE_PATHS]:
                self.assertIn(path, contract['retired'])
            self.assertFalse(set(contract['group']) & set(contract['retired']))
        with self.assertRaises(ValueError):
            r.case_contract('all')

    def test_public_health_does_not_accept_404_as_homepage_health(self):
        with patch.object(r, 'run', return_value='404'), self.assertRaises(RuntimeError):
            r.public_probe('https://example.test', r.case_contract('either'))

    def test_public_health_rejects_reappearing_retired_page(self):
        with patch.object(r, 'run', return_value='200'), self.assertRaisesRegex(RuntimeError, '/zh/solutions'):
            r.public_probe('https://example.test', r.case_contract('either'))

    def test_public_health_accepts_each_valid_case_state(self):
        opened = {path: 200 for path in CASE_GROUP}
        live = sitemap('/zh/news', '/en/news', *CASE_GROUP, alternates=['/zh/case', '/en/case'])
        closed = sitemap('/zh/news', '/en/news')
        for state, statuses, xml in [('open', opened, live), ('either', opened, live),
                                     ('either', {}, closed), ('closed', {}, closed)]:
            with self.subTest(state=state), patch.object(r, 'run', side_effect=site(statuses, xml)):
                r.public_probe('https://example.test', r.case_contract(state))

    def test_public_health_rejects_case_state_violations(self):
        opened = {path: 200 for path in CASE_GROUP}
        live = sitemap('/zh/news', '/en/news', *CASE_GROUP)
        cases = [
            ('open', {}, live, 'case route'),
            ('closed', opened, live, 'case route'),
            ('either', {f'/zh/case/{HENAN}': 200}, live, 'case route'),
            ('open', opened, sitemap('/zh/news', '/en/news', '/zh/case'), 'sitemap'),
            ('either', {}, live, 'sitemap'),
            ('open', opened, sitemap('/zh/news', '/en/news', *CASE_GROUP, '/zh/case/jining-support-roller-heat-treatment-line'), 'sitemap'),
            ('open', opened, sitemap('/zh/news', '/en/news', *CASE_GROUP, '/zh/case?page=2'), 'sitemap'),
            ('open', opened, sitemap('/zh/news', '/en/news', *CASE_GROUP, alternates=['/en/solutions']), 'sitemap'),
            ('open', opened, sitemap('/zh/news', *CASE_GROUP), 'sitemap'),
        ]
        for state, statuses, xml, message in cases:
            with self.subTest(state=state, statuses=statuses, xml=xml), \
                 patch.object(r, 'run', side_effect=site(statuses, xml)), self.assertRaisesRegex(RuntimeError, message):
                r.public_probe('https://example.test', r.case_contract(state))

    def test_manifest_case_lists_are_validated(self):
        value = {**MANIFEST, 'approvedCases': {'zh': [HENAN], 'en': []}, 'legacyEncodedPaths': True}
        self.assertEqual(r.validate_manifest(value), value)
        for cases in [{'zh': [HENAN]}, {'zh': HENAN, 'en': []}, {'zh': ['../etc'], 'en': []}, {'zh': [], 'en': [HENAN]}]:
            with self.subTest(cases=cases), self.assertRaises(ValueError):
                r.validate_manifest({**MANIFEST, 'approvedCases': cases})
        with self.assertRaises(ValueError):
            r.validate_manifest({**MANIFEST, 'legacyEncodedPaths': 'yes'})

    def test_a_single_leaking_draft_or_encoded_path_fails(self):
        opened = {path: 200 for path in CASE_GROUP}
        live = sitemap('/zh/news', '/en/news', *CASE_GROUP)
        target = r.case_contract('open')
        encoded_draft = '/zh/%63ase/alloy-eight-furnaces-acceptance-supply-boundaries-proposal'
        self.assertIn(encoded_draft, target['retired'])
        for path in [*r.DRAFT_CASE_PATHS, *r.ENCODED_WITHDRAWN_PATHS, encoded_draft]:
            with self.subTest(target=path), patch.object(r, 'run', side_effect=site({**opened, path: 200}, live)), \
                 self.assertRaisesRegex(RuntimeError, re.escape(path)):
                r.public_probe('https://example.test', target)
        lenient = r.case_contract('either', encoded=False)
        for path in r.DRAFT_CASE_PATHS:
            with self.subTest(lenient=path), patch.object(r, 'run', side_effect=site({**opened, path: 200}, live)), \
                 self.assertRaisesRegex(RuntimeError, re.escape(path)):
                r.public_probe('https://example.test', lenient)
        # Images before this release still resolve encoded section names; a rollback must stay possible.
        leaky = {**opened, **{path: 200 for path in r.ENCODED_WITHDRAWN_PATHS}, encoded_draft: 200}
        with patch.object(r, 'run', side_effect=site(leaky, live)):
            r.public_probe('https://example.test', lenient)

    def test_lenient_contract_accepts_an_earlier_or_later_batch(self):
        batch1 = r.APPROVED_CASES
        batch2 = {'zh': [HENAN, 'batch-two'], 'en': [HENAN]}
        lenient = r.case_contract('either', r.merge_cases(r.normalize_cases(batch1), r.normalize_cases(batch2)), encoded=False)
        second = ['/zh/case', f'/zh/case/{HENAN}', '/zh/case/batch-two', '/en/case', f'/en/case/{HENAN}']
        for paths in [CASE_GROUP, second, []]:
            with self.subTest(paths=paths), patch.object(r, 'run', side_effect=site({p: 200 for p in paths}, sitemap('/zh/news', '/en/news', *paths))):
                r.public_probe('https://example.test', lenient)
        # Rolling back to batch 1 checks that image against its own list.
        with patch.object(r, 'run', side_effect=site({p: 200 for p in CASE_GROUP}, sitemap('/zh/news', '/en/news', *CASE_GROUP))):
            r.public_probe('https://example.test', r.case_contract('open', batch1, withdrawn=batch2))

    def test_withdrawn_pages_must_disappear_from_the_new_image(self):
        contract = r.case_contract('open', r.APPROVED_CASES, withdrawn={'zh': [HENAN, 'batch-two'], 'en': []})
        self.assertIn('/zh/case/batch-two', contract['retired'])
        self.assertNotIn(f'/zh/case/{HENAN}', contract['retired'])
        still_served = {**{p: 200 for p in CASE_GROUP}, '/zh/case/batch-two': 200}
        with patch.object(r, 'run', side_effect=site(still_served, sitemap('/zh/news', '/en/news', *CASE_GROUP))), \
             self.assertRaisesRegex(RuntimeError, 'batch-two'):
            r.public_probe('https://example.test', contract)

    def test_release_contracts_follow_the_live_and_target_case_lists(self):
        with tempfile.TemporaryDirectory() as tmp:
            live, audit = Path(tmp) / 'live', Path(tmp) / 'audit'
            live.mkdir()
            audit.mkdir()
            served = {'zh': [HENAN, 'batch-two'], 'en': [HENAN]}
            (live / 'RELEASE_ARTIFACTS.json').write_text(json.dumps({**RECEIPT, 'frontendRelease': {**MANIFEST, 'servedCases': served}}))
            release = r.Release(live, audit, {**MANIFEST, 'approvedCases': r.APPROVED_CASES}, 'script')
            self.assertIn('/zh/case/batch-two', release.lenient_contract['group'])
            self.assertIn('/zh/case/batch-two', release.target_contract['retired'])
            self.assertEqual(release.served_cases, r.normalize_cases(r.APPROVED_CASES))
            closed = r.Release(live, audit, {**MANIFEST, 'caseState': 'closed', 'approvedCases': r.NO_CASES,
                                             'legacyEncodedPaths': True}, 'script')
            self.assertEqual(closed.served_cases, r.NO_CASES)
            self.assertIn(f'/zh/case/{HENAN}', closed.target_contract['retired'])
            self.assertFalse(any('%' in path for path in closed.target_contract['retired']))

    def test_waits_for_health_instead_of_only_image_identity(self):
        row = rows()[0]
        row['State']['Health']['Status'] = 'starting'
        with patch.object(r, 'run', return_value=json.dumps([row])), patch.object(r.time, 'sleep'), self.assertRaises(RuntimeError):
            r.wait_healthy('fixture')

    def fixture(self, tmp):
        live = Path(tmp) / 'live'
        audit = Path(tmp) / 'audit'
        live.mkdir()
        audit.mkdir()
        (live / 'RELEASE_ARTIFACTS.json').write_text(json.dumps(RECEIPT))
        (live / 'verified-images.override.yml').write_text('original pins')
        return r.Release(live, audit, MANIFEST, 'fixture health script')

    def test_bad_candidate_fails_before_replacing_frontend_or_receipts(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            with patch.object(r, 'inspect', side_effect=lambda names: [x for x in rows() if x['Name'][11:] in names]), \
                 patch.object(r, 'run', return_value=json.dumps([{'Id': NEW, 'Config': {'Labels': {'org.opencontainers.image.revision': MANIFEST['sourceCommit']}}}])), \
                 patch.object(r, 'wait_healthy'), patch.object(r, 'probe', side_effect=RuntimeError('retired route returned 200')), \
                 patch.object(r.subprocess, 'run'), patch.object(release, 'replace_frontend') as replace:
                with self.assertRaises(RuntimeError): release.execute(apply=True)
                replace.assert_not_called()
                self.assertEqual(json.loads(release.receipt_path.read_text()), RECEIPT)
                self.assertFalse(release.pending_path.exists())

    def test_hold_and_pending_operation_block_before_docker(self):
        for marker in ['.DO_NOT_DEPLOY', 'DEPLOYMENT_IN_PROGRESS.json']:
            with tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp)
                (release.live / marker).write_text('{}')
                with patch.object(r, 'inspect') as inspect, self.assertRaises(RuntimeError):
                    release.execute(apply=True)
                inspect.assert_not_called()

    def perform(self, release, failure=None):
        state = {'image': OLD, 'switches': 0, 'contracts': []}
        def inspect(names): return [row for row in rows(state['image']) if row['Name'].removeprefix('/corp-site-') in names]
        def replace(override=None):
            state['switches'] += 1
            if override and failure == 'recovery': raise RuntimeError('restore failure')
            state['image'] = OLD if override else NEW
        def public(_, contract):
            state['contracts'].append((state['image'], 'public', contract['state']))
            if state['image'] == NEW and failure: raise RuntimeError('public verification failure')
            return [{'path': '/zh', 'status': 200}]
        def internal(container, script, contract):
            state['contracts'].append((state['image'], 'internal', contract['state']))
            return GOOD
        with patch.object(r, 'inspect', side_effect=inspect), patch.object(r, 'run', return_value=json.dumps([{'Id': NEW, 'Config': {'Labels': {'org.opencontainers.image.revision': MANIFEST['sourceCommit']}}}])), \
             patch.object(r, 'wait_healthy'), patch.object(r, 'probe', side_effect=internal), patch.object(r, 'public_probe', side_effect=public), \
             patch.object(r.subprocess, 'run'), patch.object(release, 'replace_frontend', side_effect=replace):
            if failure:
                with self.assertRaises(RuntimeError): release.execute(apply=True, kind='rollback')
            else:
                result = release.execute(apply=True)
                self.assertTrue(result['applied'])
        return state

    def test_canary_uses_supported_run_options_without_build_or_pull(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            calls = []
            def command(args, **kwargs):
                calls.append(args)
                if args[:3] == ['docker', 'image', 'inspect']:
                    return json.dumps([{'Id': NEW, 'Config': {'Labels': {'org.opencontainers.image.revision': MANIFEST['sourceCommit']}}}])
                if 'run' in args:
                    self.assertNotIn('--no-build', args)
                    self.assertNotIn('--build', args)
                    self.assertIn('--no-deps', args)
                    self.assertEqual(args[args.index('--pull') + 1], 'never')
                return ''
            def current(names):
                return [row for row in rows(OLD) if row['Name'].removeprefix('/corp-site-') in names]
            with patch.object(r, 'inspect', side_effect=current), patch.object(r, 'run', side_effect=command), \
                 patch.object(r, 'wait_healthy'), patch.object(r, 'probe', return_value=GOOD), \
                 patch.object(r, 'public_probe', return_value=[]), patch.object(r.subprocess, 'run'):
                result = release.execute(apply=False)
            self.assertFalse(result['applied'])
            self.assertEqual(len([args for args in calls if 'run' in args]), 1)

    def test_dangling_pending_marker_blocks_before_docker(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            release.pending_path.symlink_to(release.live / 'missing')
            with patch.object(r, 'inspect') as inspect, self.assertRaises(RuntimeError):
                release.execute(apply=True)
            inspect.assert_not_called()

    def test_success_updates_running_identity_pins_and_receipt_together(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            state = self.perform(release)
            self.assertEqual(state['image'], NEW)
            receipt = json.loads(release.receipt_path.read_text())
            pins = json.loads(release.pins_path.read_text())
            self.assertEqual(receipt['images']['frontend'], pins['services']['frontend']['image'])
            self.assertEqual(receipt['frontendRelease'], {**MANIFEST, 'servedCases': r.normalize_cases(r.APPROVED_CASES)})
            self.assertFalse(release.pending_path.exists())
            self.assertEqual(receipt['images']['backend'], RECEIPT['images']['backend'])

    def test_target_is_checked_open_and_restored_image_is_checked_leniently(self):
        with tempfile.TemporaryDirectory() as tmp:
            state = self.perform(self.fixture(tmp))
            self.assertEqual(state['contracts'], [(OLD, 'internal', 'open'), (NEW, 'internal', 'open'), (NEW, 'public', 'open')])
        with tempfile.TemporaryDirectory() as tmp:
            state = self.perform(self.fixture(tmp), failure='public')
            self.assertEqual(state['contracts'][-2:], [(OLD, 'internal', 'either'), (OLD, 'public', 'either')])

    def test_preflight_checks_the_unchanged_public_site_leniently(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            seen = []
            def command(args, **kwargs):
                if args[:3] == ['docker', 'image', 'inspect']:
                    return json.dumps([{'Id': NEW, 'Config': {'Labels': {'org.opencontainers.image.revision': MANIFEST['sourceCommit']}}}])
                return ''
            with patch.object(r, 'inspect', side_effect=lambda names: [x for x in rows() if x['Name'][11:] in names]), \
                 patch.object(r, 'run', side_effect=command), patch.object(r, 'wait_healthy'), \
                 patch.object(r, 'probe', side_effect=lambda c, s, contract: seen.append(('internal', contract['state'])) or GOOD), \
                 patch.object(r, 'public_probe', side_effect=lambda u, contract: seen.append(('public', contract['state'])) or []), \
                 patch.object(r.subprocess, 'run'):
                release.execute(apply=False)
            self.assertEqual(seen, [('internal', 'open'), ('public', 'either')])

    def test_failed_switch_restores_previous_frontend_and_preserves_receipt(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            state = self.perform(release, failure='public')
            self.assertEqual((state['image'], state['switches']), (OLD, 2))
            self.assertEqual(json.loads(release.receipt_path.read_text()), RECEIPT)
            self.assertFalse(release.pending_path.exists())

    def test_failed_recovery_reports_actual_image_and_leaves_pending_marker(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            self.perform(release, failure='recovery')
            receipt = json.loads(release.receipt_path.read_text())
            self.assertEqual(receipt['images']['frontend'], NEW)
            self.assertEqual(receipt['deploymentStatus'], 'recovery-required')
            self.assertTrue(release.pending_path.exists())



class UnifiedReleaseTest(unittest.TestCase):
    def fixture(self, tmp):
        release = ContractTest().fixture(tmp)
        manifest = {**MANIFEST, 'backend': {'image': 'sha256:' + '9' * 64,
                    'expectedCurrentImage': RECEIPT['images']['backend'], 'archiveSha256': '8' * 64}}
        return r.Release(release.live, release.audit, manifest, 'fixture health script')

    def test_backend_manifest_requires_exact_previous_version_and_shared_source(self):
        for value in [{}, {'image':'backend:latest'}, {'image':NEW, 'expectedCurrentImage':OLD, 'archiveSha256':'bad'}]:
            with self.assertRaises(ValueError): r.validate_manifest({**MANIFEST, 'backend':value})

    def test_bundle_success_and_frontend_failure_restore_both_components(self):
        for fails in [False, True]:
            with self.subTest(fails=fails), tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp)
                state = dict(RECEIPT['images'])
                def current(names):
                    result = rows(state['frontend'])
                    for row in result:
                        name = row['Name'].removeprefix('/corp-site-')
                        if name in state:
                            row['Image'] = state[name]
                            row['Id'] = name + state[name]
                    return [row for row in result if row['Name'].removeprefix('/corp-site-') in names]
                def command(args, **kwargs):
                    if args[:3] == ['docker','image','inspect']:
                        return json.dumps([{'Id':args[-1], 'Config':{'Labels':{'org.opencontainers.image.revision':MANIFEST['sourceCommit']}}}])
                    return ''
                def replace(override=None): state.update(RECEIPT['images'] if override else release.target)
                def public(*_):
                    if fails and state['frontend']==NEW: raise RuntimeError('frontend fails')
                    return []
                with patch.object(r,'inspect',side_effect=current), patch.object(r,'run',side_effect=command), \
                     patch.object(r,'wait_healthy'), patch.object(r,'probe',return_value=GOOD), \
                     patch.object(r,'public_probe',side_effect=public), patch.object(r.subprocess,'run'), \
                     patch.object(release,'backend_check',return_value={'passed':True}) as check, \
                     patch.object(release,'replace_frontend',side_effect=replace):
                    if fails:
                        with self.assertRaises(RuntimeError): release.execute(True)
                        self.assertEqual(state, RECEIPT['images'])
                    else:
                        self.assertTrue(release.execute(True)['applied'])
                        self.assertEqual(state, release.target)
                        self.assertIn(unittest.mock.call(migrate=True),check.call_args_list)
                    self.assertEqual(state['admin'], RECEIPT['images']['admin'])
                    self.assertFalse(release.pending_path.exists())

    def test_backend_preflight_failure_does_not_switch_or_migrate(self):
        with tempfile.TemporaryDirectory() as tmp:
            release=self.fixture(tmp)
            def image(args,**kwargs):
                return json.dumps([{'Id':args[-1], 'Config':{'Labels':{'org.opencontainers.image.revision':MANIFEST['sourceCommit']}}}])
            with patch.object(r,'inspect',return_value=rows()), patch.object(r,'run',side_effect=image), \
                 patch.object(release,'backend_check',side_effect=RuntimeError('invalid database history')) as check, \
                 patch.object(release,'replace_frontend') as replace:
                with self.assertRaises(RuntimeError): release.execute(True)
                replace.assert_not_called()
                check.assert_called_once_with()
                self.assertFalse(release.pending_path.exists())

@unittest.skipUnless(shutil.which('node'), 'node is required to run the container health script')
class HealthScriptTest(unittest.TestCase):
    """Runs the real check-frontend.cjs against a stub site."""

    LIVE = ['/zh', '/en', '/zh/news', '/en/news', '/zh/products', '/en/products',
            '/zh/about', '/en/about', '/zh/inquiry', '/en/contact']
    OPENED = {path: 200 for path in CASE_GROUP}
    LISTED = sitemap('/zh/news', '/en/news', *CASE_GROUP, alternates=['/zh/case'])

    def run_script(self, contract, statuses, xml):
        """Returns (exit code, report, number of requests the stub received)."""
        requests = []
        live = self.LIVE

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                requests.append(self.path)
                if self.path == '/sitemap.xml':
                    code, body = 200, xml.encode()
                else:
                    code, body = statuses.get(self.path, 200 if self.path in live else 404), b''
                self.send_response(code)
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *args):
                pass

        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            env = {k: v for k, v in os.environ.items() if k != 'RELEASE_CASE_CONTRACT'}
            env['RELEASE_CHECK_BASE'] = f'http://127.0.0.1:{server.server_port}'
            if contract is not None:
                env['RELEASE_CASE_CONTRACT'] = json.dumps(contract)
            script = Path(__file__).with_name('check-frontend.cjs').read_text()
            result = subprocess.run(['node', '-e', script], env=env, capture_output=True, text=True, timeout=60)
        finally:
            server.shutdown()
            server.server_close()
        report = json.loads(result.stdout) if result.stdout.strip() else {}
        return result.returncode, report, len(requests)

    def test_open_release_passes_only_with_every_approved_case_listed_and_served(self):
        code, report, _ = self.run_script(r.case_contract('open'), self.OPENED, self.LISTED)
        self.assertEqual((code, report['passed'], report['caseState']), (0, True, 'open'))
        self.assertNotEqual(self.run_script(r.case_contract('open'), {}, sitemap('/zh/news', '/en/news'))[0], 0)
        self.assertNotEqual(self.run_script(r.case_contract('open'), self.OPENED, sitemap('/zh/news', '/en/news', '/zh/case'))[0], 0)

    def test_a_single_leaking_draft_encoded_path_or_alternate_fails(self):
        contract = r.case_contract('open')
        for path in [p for p in contract['retired'] if '/case/' in p or '%' in p]:
            with self.subTest(path=path):
                code, report, _ = self.run_script(contract, {**self.OPENED, path: 200}, self.LISTED)
                self.assertNotEqual(code, 0)
                self.assertFalse(report.get('passed'))
        for alternate in ['/en/solutions', '/zh/case/jining-support-roller-heat-treatment-line', '/zh/articles/x']:
            with self.subTest(alternate=alternate):
                xml = sitemap('/zh/news', '/en/news', *CASE_GROUP, alternates=[alternate])
                self.assertNotEqual(self.run_script(contract, self.OPENED, xml)[0], 0)

    def test_current_or_restored_image_may_predate_cases_but_never_leaks_drafts(self):
        lenient = r.case_contract('either', encoded=False)
        self.assertEqual(self.run_script(lenient, {}, sitemap('/zh/news', '/en/news'))[0], 0)
        leaked = sitemap('/zh/news', '/en/news', *CASE_GROUP, '/zh/case/jining-support-roller-heat-treatment-line')
        self.assertNotEqual(self.run_script(lenient, self.OPENED, leaked)[0], 0)
        self.assertNotEqual(self.run_script(lenient, {f'/en/case/{HENAN}': 200}, sitemap('/zh/news', '/en/news'))[0], 0)
        self.assertNotEqual(self.run_script(lenient, {**self.OPENED, r.DRAFT_CASE_PATHS[0]: 200}, self.LISTED)[0], 0)

    def test_missing_contract_fails_closed_without_querying_a_healthy_site(self):
        code, report, requests = self.run_script(None, self.OPENED, self.LISTED)
        self.assertNotEqual(code, 0)
        self.assertNotEqual(report.get('passed'), True)
        self.assertEqual(requests, 0)
        code, _, requests = self.run_script({**r.case_contract('open'), 'state': 'all'}, self.OPENED, self.LISTED)
        self.assertNotEqual(code, 0)
        self.assertEqual(requests, 0)


if __name__ == '__main__':
    unittest.main(verbosity=2)
