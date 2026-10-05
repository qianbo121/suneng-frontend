import copy
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
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
OTHER = 'sha256:' + '7' * 64
LEGACY = sorted(r.LEGACY_ENCODING_IMAGES)[0]
LEGACY_ROLLBACK = {**MANIFEST, 'image': LEGACY, 'caseState': 'closed', 'approvedCases': r.NO_CASES,
                   'legacyEncodedPaths': True, 'legacyEncodedPathsApproval': 'site owner, 2026-09-17'}


def sitemap(*paths, alternates=(), images=()):
    links = ''.join(f'<xhtml:link rel="alternate" hreflang="x" href="https://example.test{p}"/>' for p in alternates)
    # Next lists page images in the image extension namespace.
    pictures = ''.join(f'<image:image>\n<image:loc>https://example.test{p}</image:loc>\n</image:image>' for p in images)
    urls = ''.join(f'<url><loc>https://example.test{p}</loc>{links}{pictures}</url>' for p in paths)
    return ('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
            'xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
            f'{urls}</urlset>')


def image_inspect(args, **kwargs):
    """docker image inspect for whichever exact image was requested."""
    if args[:3] != ['docker', 'image', 'inspect']:
        raise AssertionError(args)
    return json.dumps([{'Id': args[-1], 'Config': {'Labels': {'org.opencontainers.image.revision': MANIFEST['sourceCommit']}}}])


def canary_docker(args, **kwargs):
    """Image inspection plus starting the canary container."""
    if args[:3] == ['docker', 'image', 'inspect']:
        return image_inspect(args)
    if args[:2] == ['docker', 'compose'] and 'run' in args:
        return ''
    raise AssertionError(args)


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


class MockAcquisitionChecks:
    """Other release-contract tests isolate their existing concern from this gate."""
    def setUp(self):
        super().setUp()
        check = patch.object(r, 'acquisition_continuity_probe', return_value={'passed': True, 'pagesChecked': 11})
        check.start()
        self.addCleanup(check.stop)


class ContractTest(MockAcquisitionChecks, unittest.TestCase):
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
        value = {**MANIFEST, 'approvedCases': {'zh': [HENAN], 'en': []}, 'legacyEncodedPaths': False}
        self.assertEqual(r.validate_manifest(value), value)
        for cases in [{'zh': [HENAN]}, {'zh': HENAN, 'en': []}, {'zh': ['../etc'], 'en': []}, {'zh': [], 'en': [HENAN]}]:
            with self.subTest(cases=cases), self.assertRaises(ValueError):
                r.validate_manifest({**MANIFEST, 'approvedCases': cases})
        with self.assertRaises(ValueError):
            r.validate_manifest({**MANIFEST, 'legacyEncodedPaths': 'yes'})

    def test_only_an_approved_rollback_to_a_known_earlier_image_skips_encoded_probes(self):
        self.assertEqual(r.validate_manifest(LEGACY_ROLLBACK), LEGACY_ROLLBACK)
        unapproved = {key: value for key, value in LEGACY_ROLLBACK.items() if key != 'legacyEncodedPathsApproval'}
        for value in [unapproved, {**LEGACY_ROLLBACK, 'legacyEncodedPathsApproval': ' '},
                      {**LEGACY_ROLLBACK, 'legacyEncodedPathsApproval': None},
                      {**LEGACY_ROLLBACK, 'legacyEncodedPathsApproval': 'x' * 201},
                      {**LEGACY_ROLLBACK, 'image': NEW}, {**LEGACY_ROLLBACK, 'image': OTHER}]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                r.validate_manifest(value)
        # A deploy may not use the rollback exemption, even with the approved manifest.
        for apply in [False, True]:
            with self.subTest(apply=apply), tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp, LEGACY_ROLLBACK)
                with patch.object(r, 'inspect') as inspect, patch.object(r, 'run') as run, \
                     self.assertRaisesRegex(RuntimeError, 'rollback'):
                    release.execute(apply=apply)
                inspect.assert_not_called()
                run.assert_not_called()
        # The approved rollback checks the old image without encoded probes.
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp, LEGACY_ROLLBACK)
            seen = []
            with patch.object(r, 'inspect', side_effect=lambda names: [x for x in rows() if x['Name'][11:] in names]), \
                 patch.object(r, 'run', side_effect=canary_docker), patch.object(r, 'wait_healthy'), \
                 patch.object(r, 'probe', side_effect=lambda c, s, contract: seen.append(contract) or {**GOOD, 'caseState': contract['state']}), \
                 patch.object(r, 'public_probe', side_effect=lambda u, contract: seen.append(contract) or []), \
                 patch.object(r.subprocess, 'run'):
                self.assertFalse(release.execute(apply=False, kind='rollback')['applied'])
            self.assertEqual([contract['state'] for contract in seen], ['closed', 'either'])
            self.assertFalse(any('%' in path for contract in seen for path in contract['retired']))

    def test_a_single_leaking_draft_or_encoded_path_fails(self):
        opened = {path: 200 for path in CASE_GROUP}
        live = sitemap('/zh/news', '/en/news', *CASE_GROUP)
        target = r.case_contract('open')
        encoded_draft = '/zh/%63ase/anonymous-tsingshan-1250-renovation'
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
            closed = r.Release(live, audit, LEGACY_ROLLBACK, 'script')
            self.assertEqual(closed.served_cases, r.NO_CASES)
            self.assertIn(f'/zh/case/{HENAN}', closed.target_contract['retired'])
            self.assertFalse(any('%' in path for path in closed.target_contract['retired']))
            # A closed image serves no case even when its manifest names approved pages.
            closed_listed = r.Release(live, audit, {**MANIFEST, 'caseState': 'closed', 'approvedCases': r.APPROVED_CASES}, 'script')
            self.assertEqual(closed_listed.served_cases, r.NO_CASES)
            self.assertEqual(closed_listed.target_contract['state'], 'closed')

    def test_every_release_without_the_rollback_exemption_probes_encoded_addresses(self):
        encoded_draft = '/zh/%63ase/anonymous-tsingshan-1250-renovation'
        for manifest in [MANIFEST, {**MANIFEST, 'caseState': 'closed', 'approvedCases': r.NO_CASES},
                         {**MANIFEST, 'legacyEncodedPaths': False}]:
            with self.subTest(manifest=manifest), tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp, manifest)
                for path in [*r.ENCODED_WITHDRAWN_PATHS, encoded_draft]:
                    self.assertIn(path, release.target_contract['retired'])
                self.assertFalse(any('%' in path for path in release.lenient_contract['retired']))
        # Both languages and every router normalisation seen in the live leak are probed.
        paths = ' '.join(r.ENCODED_WITHDRAWN_PATHS)
        for marker in ['/zh/', '/en/', '%09', '%0A', '%0D', '%20', '%1F', '%252e%252e']:
            self.assertIn(marker, paths)

    def test_either_state_accepts_only_served_or_missing_case_pages(self):
        lenient = r.case_contract('either', encoded=False)
        for code in [500, 308, 0]:
            for path in CASE_GROUP:
                with self.subTest(code=code, path=path), \
                     patch.object(r, 'run', side_effect=site({path: code}, sitemap('/zh/news', '/en/news'))), \
                     self.assertRaisesRegex(RuntimeError, 'case route'):
                    r.public_probe('https://example.test', lenient)

    def test_sitemap_images_are_not_page_addresses(self):
        xml = sitemap('/zh/news', '/en/news', *CASE_GROUP, alternates=['/zh/case'],
                      images=['/images/case/cover.webp', '/images/solutions/line.webp'])
        located, alternates = r.sitemap_urls(xml)
        self.assertEqual({url.removeprefix('https://example.test') for url in located}, {'/zh/news', '/en/news', *CASE_GROUP})
        self.assertEqual({url.removeprefix('https://example.test') for url in alternates}, {'/zh/case'})
        with patch.object(r, 'run', side_effect=site({p: 200 for p in CASE_GROUP}, xml)):
            r.public_probe('https://example.test', r.case_contract('open'))
        # A page address in the same places still counts.
        leaked = sitemap('/zh/news', '/en/news', *CASE_GROUP, '/zh/solutions/line', images=['/images/case/cover.webp'])
        with patch.object(r, 'run', side_effect=site({p: 200 for p in CASE_GROUP}, leaked)), \
             self.assertRaisesRegex(RuntimeError, 'sitemap'):
            r.public_probe('https://example.test', r.case_contract('open'))

    def test_waits_for_health_instead_of_only_image_identity(self):
        row = rows()[0]
        row['State']['Health']['Status'] = 'starting'
        with patch.object(r, 'run', return_value=json.dumps([row])), patch.object(r.time, 'sleep'), self.assertRaises(RuntimeError):
            r.wait_healthy('fixture')

    def fixture(self, tmp, manifest=MANIFEST, receipt=RECEIPT):
        live = Path(tmp) / 'live'
        audit = Path(tmp) / 'audit'
        live.mkdir()
        audit.mkdir()
        (live / 'RELEASE_ARTIFACTS.json').write_text(json.dumps(receipt))
        (live / 'verified-images.override.yml').write_text('original pins')
        return r.Release(live, audit, manifest, 'fixture health script')

    def test_public_html_mismatch_rolls_back_without_recording_success(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp, {**MANIFEST, 'htmlCachePolicy': 'no-store'})
            state = {'image': OLD}
            def current(names):
                return [row for row in rows(state['image']) if row['Name'][11:] in names]
            def replace(override=None):
                state['image'] = OLD if override else NEW
            candidate = {'/zh': {'scripts': ['new']}, '/en': {'scripts': ['new']}}
            with patch.object(r, 'inspect', side_effect=current), patch.object(r, 'run', side_effect=canary_docker), \
                 patch.object(r, 'wait_healthy'), patch.object(r, 'probe', return_value=GOOD), \
                 patch.object(r, 'public_probe', return_value=[]), patch.object(r.subprocess, 'run'), \
                 patch.object(release, 'replace_frontend', side_effect=replace), \
                 patch.object(r, 'frontend_html_probe', side_effect=[candidate, RuntimeError('stale public homepage')]) as check:
                with self.assertRaises(RuntimeError):
                    release.execute(apply=True)
            self.assertEqual(check.call_args.kwargs['expected'], candidate)
            self.assertEqual(state['image'], OLD)
            self.assertEqual(json.loads(release.receipt_path.read_text()), RECEIPT)

    def test_html_cache_policy_rejects_unknown_values(self):
        with self.assertRaises(ValueError):
            r.validate_manifest({**MANIFEST, 'htmlCachePolicy': 'cache-forever'})

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

    def test_low_space_stops_before_starting_a_candidate(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            with patch.object(r, 'working_space', side_effect=RuntimeError('Insufficient space')), \
                 patch.object(r, 'inspect') as inspect:
                with self.assertRaisesRegex(RuntimeError, 'Insufficient'):
                    release.execute(apply=True)
                inspect.assert_not_called()
            self.assertEqual(json.loads(release.receipt_path.read_text()), RECEIPT)
            self.assertFalse(release.pending_path.exists())

    def test_space_lost_during_preflight_stops_before_switching(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            with patch.object(r, 'working_space', side_effect=[{'passed': True}, RuntimeError('Insufficient space')]) as capacity, \
                 patch.object(r, 'inspect', side_effect=lambda names: [x for x in rows() if x['Name'][11:] in names]), \
                 patch.object(r, 'run', side_effect=canary_docker), patch.object(r, 'wait_healthy'), \
                 patch.object(r, 'probe', return_value=GOOD), patch.object(r.subprocess, 'run'), \
                 patch.object(release, 'replace_frontend') as replace:
                with self.assertRaisesRegex(RuntimeError, 'Insufficient'):
                    release.execute(apply=True)
                self.assertEqual(capacity.call_count, 2)
                replace.assert_not_called()
            self.assertEqual(json.loads(release.receipt_path.read_text()), RECEIPT)
            self.assertEqual((release.live / 'verified-images.override.yml').read_text(), 'original pins')
            self.assertFalse(release.pending_path.exists())

    def test_hold_and_pending_operation_block_before_docker(self):
        for marker in ['.DO_NOT_DEPLOY', 'DEPLOYMENT_IN_PROGRESS.json']:
            with tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp)
                (release.live / marker).write_text('{}')
                with patch.object(r, 'inspect') as inspect, self.assertRaises(RuntimeError):
                    release.execute(apply=True)
                inspect.assert_not_called()

    def perform(self, release, failure=None, kind='deploy'):
        """failure: 'public' (new image fails), 'recovery' (switching back fails),
        'restored-check' (old image is back but fails its check), 'other-image'
        (switching back leaves an unexpected image)."""
        state = {'image': OLD, 'switches': 0, 'contracts': [], 'pending': None}
        def inspect(names): return [row for row in rows(state['image']) if row['Name'].removeprefix('/corp-site-') in names]
        def replace(override=None):
            state['switches'] += 1
            if not override and release.pending_path.exists():
                state['pending'] = json.loads(release.pending_path.read_text())
            if override and failure == 'recovery': raise RuntimeError('restore failure')
            state['image'] = (OTHER if failure == 'other-image' else OLD) if override else NEW
        def public(_, contract):
            state['contracts'].append((state['image'], 'public', contract['state']))
            if failure and (state['image'] == NEW or failure == 'restored-check'):
                raise RuntimeError('public verification failure')
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
                result = release.execute(apply=True, kind=kind)
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
            pending = json.loads((release.audit / 'retention-pending.json').read_text())
            self.assertEqual(pending['components'], ['frontend'])
            self.assertTrue(pending['acceptanceRequired'])
            self.assertEqual(json.loads((release.audit / 'result.json').read_text())['retention']['status'],
                             'awaiting-acceptance')

    def test_cleanup_queue_failure_does_not_fail_or_roll_back_a_healthy_publication(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            with patch('release_retention.queue', side_effect=OSError('cannot write cleanup plan')):
                state = self.perform(release)
            self.assertEqual((state['image'], state['switches']), (NEW, 1))
            result = json.loads((release.audit / 'result.json').read_text())
            self.assertTrue(result['passed'])
            self.assertEqual(result['retention'], {'status': 'needs-attention', 'imagesRemoved': False})

    def test_successful_rollback_never_queues_cleanup(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            self.perform(release, kind='rollback')
            self.assertFalse((release.audit / 'retention-pending.json').exists())

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
            self.assertFalse((release.audit / 'retention-pending.json').exists())

    def test_failed_switch_restores_previous_frontend_and_preserves_receipt(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            state = self.perform(release, failure='public')
            self.assertEqual((state['image'], state['switches']), (OLD, 2))
            self.assertEqual(json.loads(release.receipt_path.read_text()), RECEIPT)
            self.assertFalse(release.pending_path.exists())
            self.assertFalse((release.audit / 'retention-pending.json').exists())

    def test_failed_recovery_reports_actual_image_and_leaves_pending_marker(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            self.perform(release, failure='recovery')
            receipt = json.loads(release.receipt_path.read_text())
            self.assertEqual(receipt['images']['frontend'], NEW)
            self.assertEqual(receipt['deploymentStatus'], 'recovery-required')
            self.assertTrue(release.pending_path.exists())

    def test_failed_recovery_records_the_cases_of_the_running_frontend(self):
        # Neither list contains the other, so their union differs from both.
        earlier = {'zh': ['batch-two'], 'en': []}
        receipt = {**RECEIPT, 'frontendRelease': {**MANIFEST, 'image': OLD, 'servedCases': earlier}}
        target = r.normalize_cases(r.APPROVED_CASES)
        expected = {
            # The new image is still running.
            'recovery': ({**MANIFEST, 'servedCases': target}, NEW),
            # The old image is back but unverified.
            'restored-check': (receipt['frontendRelease'], OLD),
            # Neither image is running: either list may be served.
            'other-image': ({**receipt['frontendRelease'], 'servedCases': r.merge_cases(earlier, target),
                             'servedCasesUnverified': True}, OTHER),
        }
        for failure, (release_record, image) in expected.items():
            with self.subTest(failure=failure), tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp, receipt=receipt)
                state = self.perform(release, failure=failure)
                saved = json.loads(release.receipt_path.read_text())
                self.assertEqual((saved['images']['frontend'], saved['deploymentStatus']), (image, 'recovery-required'))
                self.assertEqual(saved['frontendRelease'], release_record)
                self.assertTrue(release.pending_path.exists())
                self.assertEqual((state['pending']['previousServedCases'], state['pending']['targetServedCases']),
                                 (r.normalize_cases(earlier), target))
                # The next attempt checks the running site against the recorded lists.
                self.assertEqual(r.normalize_cases(saved['frontendRelease']['servedCases']),
                                 r.Release(release.live, release.audit, MANIFEST, 'script').live_cases)

    def test_same_image_is_checked_against_its_own_strict_contract(self):
        for apply in [False, True]:
            with self.subTest(apply=apply), tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp, {**MANIFEST, 'image': OLD})
                seen = []
                with patch.object(r, 'inspect', side_effect=lambda names: [x for x in rows() if x['Name'][11:] in names]), \
                     patch.object(r, 'run', side_effect=image_inspect), \
                     patch.object(r, 'probe', side_effect=lambda c, s, contract: seen.append(('internal', c, contract)) or GOOD), \
                     patch.object(r, 'public_probe', side_effect=lambda u, contract: seen.append(('public', u, contract)) or []), \
                     patch.object(r.subprocess, 'run') as cleanup, patch.object(release, 'replace_frontend') as replace:
                    self.assertFalse(release.execute(apply=apply)['applied'])
                replace.assert_not_called()
                cleanup.assert_not_called()
                self.assertEqual(seen, [('internal', 'corp-site-frontend', release.target_contract),
                                        ('public', 'https://www.jssngyl.cn', release.target_contract)])
                self.assertEqual(release.target_contract['state'], 'open')
                self.assertFalse((release.audit / 'retention-pending.json').exists())
                self.assertTrue(set(r.ENCODED_WITHDRAWN_PATHS) <= set(release.target_contract['retired']))



class UnifiedReleaseTest(MockAcquisitionChecks, unittest.TestCase):
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
                        self.assertFalse((release.audit / 'retention-pending.json').exists())
                    else:
                        self.assertTrue(release.execute(True)['applied'])
                        self.assertEqual(state, release.target)
                        self.assertIn(unittest.mock.call(migrate=True),check.call_args_list)
                        saved = json.loads(release.receipt_path.read_text())
                        self.assertEqual(saved['backendRelease'], {**release.manifest['backend'],
                                         'sourceCommit': MANIFEST['sourceCommit'], 'sourceIdentity': 'git-commit'})
                        self.assertCountEqual(json.loads((release.audit / 'retention-pending.json').read_text())['components'],
                                              ['frontend', 'backend'])
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

    def test_pending_migration_cannot_switch_without_a_verified_backup(self):
        for outcome in [ValueError('stale backup'), {'verified': False}, {'verified': True}]:
            with self.subTest(outcome=outcome), tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp)
                state = dict(RECEIPT['images'])
                events = []
                def current(names):
                    result = rows(state['frontend'])
                    for row in result:
                        name = row['Name'].removeprefix('/corp-site-')
                        if name in state:
                            row.update(Image=state[name], Id=name + state[name])
                    return [row for row in result if row['Name'].removeprefix('/corp-site-') in names]
                def command(args, **_):
                    if args[:3] == ['docker', 'image', 'inspect']:
                        return json.dumps([{'Id': args[-1], 'Config': {'Labels': {
                            'org.opencontainers.image.revision': MANIFEST['sourceCommit']}}}])
                    return ''
                def backup():
                    events.append('backup')
                    if isinstance(outcome, Exception):
                        raise outcome
                    return outcome
                def check(migrate=False, running=False):
                    events.append('migrate' if migrate else 'running' if running else 'preflight')
                    if migrate:
                        self.assertTrue(release.migration_backup_verified)
                    return {'passed': True, 'pendingMigrationCount': 1 if not migrate and not running else 0,
                            'aggregateAvailable': migrate or running}
                def replace(override=None):
                    events.append('switch')
                    state.update(RECEIPT['images'] if override else release.target)
                with patch.object(r, 'inspect', side_effect=current), patch.object(r, 'run', side_effect=command), \
                     patch.object(r, 'wait_healthy'), patch.object(r, 'probe', return_value=GOOD), \
                     patch.object(r, 'public_probe', return_value=[]), patch.object(r.subprocess, 'run'), \
                     patch.object(release, 'backend_check', side_effect=check), \
                     patch.object(release, 'verify_backup', side_effect=backup), \
                     patch.object(release, 'replace_frontend', side_effect=replace):
                    if outcome == {'verified': True}:
                        self.assertTrue(release.execute(True)['applied'])
                        self.assertEqual(events, ['preflight', 'backup', 'migrate', 'switch', 'running'])
                        self.assertEqual(state, release.target)
                    else:
                        with self.assertRaises((ValueError, RuntimeError)):
                            release.execute(True)
                        self.assertEqual(events, ['preflight', 'backup'])
                        self.assertEqual(state, RECEIPT['images'])
                    self.assertFalse(release.pending_path.exists())

    def test_backend_checks_pass_backup_status_and_reject_deferred_final_checks(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            good = {'passed': True, 'aggregateAvailable': True}
            with patch.object(r, 'run', return_value=json.dumps(good)) as command:
                release.backend_check()
                self.assertIn('RELEASE_BACKUP_VERIFIED=0', command.call_args.args[0])
                release.migration_backup_verified = True
                release.backend_check(migrate=True)
                self.assertIn('RELEASE_BACKUP_VERIFIED=1', command.call_args.args[0])
            deferred = {'passed': True, 'aggregateAvailable': None, 'aggregateDeferred': True}
            with patch.object(r, 'run', return_value=json.dumps(deferred)):
                self.assertEqual(release.backend_check(), deferred)
                for options in [{'migrate': True}, {'running': True}]:
                    with self.assertRaises(RuntimeError):
                        release.backend_check(**options)

@unittest.skipUnless(shutil.which('node'), 'node is required to run the container health script')
class HealthScriptTest(unittest.TestCase):
    """Runs the real check-frontend.cjs against a stub site."""

    LIVE = ['/zh', '/en', '/zh/news', '/en/news', '/zh/products', '/en/products',
            '/zh/about', '/en/about', '/zh/inquiry', '/en/contact']
    OPENED = {path: 200 for path in CASE_GROUP}
    LISTED = sitemap('/zh/news', '/en/news', *CASE_GROUP, alternates=['/zh/case'])

    def run_script(self, contract, statuses, xml, sitemap_status=200):
        """Returns (exit code, report, number of requests the stub received)."""
        requests = []
        live = self.LIVE

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                requests.append(self.path)
                if self.path == '/sitemap.xml':
                    code, body = sitemap_status, xml.encode()
                else:
                    code, body = statuses.get(self.path, 200 if self.path in live else 404), b''
                self.send_response(code)
                if 300 <= code < 400:
                    # A redirect to a live page must not count as the page itself.
                    self.send_header('Location', '/zh/news')
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

    def test_report_names_the_state_it_checked(self):
        empty = sitemap('/zh/news', '/en/news')
        for contract in [r.case_contract('either', encoded=False), r.case_contract('either', r.NO_CASES, encoded=False),
                         r.case_contract('closed'), r.case_contract('closed', r.NO_CASES)]:
            with self.subTest(contract=contract):
                code, report, _ = self.run_script(contract, {}, empty)
                self.assertEqual((code, report['passed'], report['caseState']), (0, True, contract['state']))

    def test_closed_state_rejects_served_case_pages(self):
        code, report, _ = self.run_script(r.case_contract('closed'), self.OPENED, sitemap('/zh/news', '/en/news'))
        self.assertNotEqual(code, 0)
        self.assertFalse(report.get('passed'))

    def test_live_pages_must_answer_200(self):
        for statuses in [{'/zh': 500}, {'/en/news': 404}, {'/zh/inquiry': 308}]:
            with self.subTest(statuses=statuses):
                code, report, _ = self.run_script(r.case_contract('open'), {**self.OPENED, **statuses}, self.LISTED)
                self.assertNotEqual(code, 0)
                self.assertFalse(report.get('passed'))

    def test_sitemap_must_be_served_complete_and_without_case_queries(self):
        contract = r.case_contract('open')
        for xml, status in [(sitemap('/zh/news', *CASE_GROUP), 200), (self.LISTED, 500),
                            (sitemap('/zh/news', '/en/news', *CASE_GROUP, '/zh/case?page=2'), 200)]:
            with self.subTest(xml=xml, status=status):
                code, report, _ = self.run_script(contract, self.OPENED, xml, sitemap_status=status)
                self.assertNotEqual(code, 0)
                self.assertFalse(report.get('sitemapPassed'))

    def test_either_state_rejects_server_errors_and_redirects(self):
        lenient = r.case_contract('either', encoded=False)
        for code in [500, 308]:
            for path in CASE_GROUP:
                with self.subTest(code=code, path=path):
                    result, report, _ = self.run_script(lenient, {path: code}, sitemap('/zh/news', '/en/news'))
                    self.assertNotEqual(result, 0)
                    self.assertFalse(report.get('passed'))

    def test_encoded_addresses_are_requested_as_written(self):
        contract = r.case_contract('closed')
        code, report, _ = self.run_script(contract, {}, sitemap('/zh/news', '/en/news'))
        self.assertEqual(code, 0)
        checked = {check['path'] for check in report['checks']}
        self.assertTrue(set(r.ENCODED_WITHDRAWN_PATHS) <= checked)
        for path in r.ENCODED_WITHDRAWN_PATHS:
            with self.subTest(path=path):
                self.assertNotEqual(self.run_script(contract, {path: 200}, sitemap('/zh/news', '/en/news'))[0], 0)

    def test_sitemap_images_are_not_page_addresses(self):
        xml = sitemap('/zh/news', '/en/news', *CASE_GROUP, alternates=['/zh/case'],
                      images=['/images/case/cover.webp', '/images/solutions/line.webp'])
        code, report, _ = self.run_script(r.case_contract('open'), self.OPENED, xml)
        self.assertEqual((code, report['sitemapPassed']), (0, True))

    def test_missing_contract_fails_closed_without_querying_a_healthy_site(self):
        code, report, requests = self.run_script(None, self.OPENED, self.LISTED)
        self.assertNotEqual(code, 0)
        self.assertNotEqual(report.get('passed'), True)
        self.assertEqual(requests, 0)
        code, _, requests = self.run_script({**r.case_contract('open'), 'state': 'all'}, self.OPENED, self.LISTED)
        self.assertNotEqual(code, 0)
        self.assertEqual(requests, 0)


class ShippedExamplesTest(unittest.TestCase):
    """The templates are what an operator copies mid-incident; keep them valid."""

    def load(self, name):
        data = json.loads((Path(__file__).with_name(name)).read_text())
        return {key: value for key, value in data.items() if not key.startswith('_')}

    def placeholder_free(self, manifest):
        # The templates ship placeholders on purpose; validate their shape, not their values.
        filled = dict(manifest, sourceCommit='e' * 40, archiveSha256='f' * 64,
                      image=NEW, expectedCurrentImage=OLD)
        if filled.get('legacyEncodedPaths'):
            filled['image'] = LEGACY
        return filled

    def test_deploy_example_is_accepted(self):
        manifest = self.placeholder_free(self.load('manifest.example.json'))
        self.assertEqual(r.validate_manifest(manifest)['publicationScope'], r.SCOPE)

    def test_rollback_example_is_accepted_and_carries_what_a_rollback_needs(self):
        raw = self.load('manifest.rollback.example.json')
        # A rollback to an earlier frontend needs the owner-approved legacy flag,
        # and the case list it will serve afterwards.
        self.assertTrue(raw['legacyEncodedPaths'])
        self.assertIn('approvedCases', raw)
        manifest = self.placeholder_free(raw)
        self.assertEqual(r.validate_manifest(manifest)['caseState'], 'open')

    def test_live_paths_agree_between_the_tool_and_the_health_script(self):
        script = (Path(__file__).with_name('check-frontend.cjs')).read_text()
        listed = re.search(r"const live = \[(.*?)\];", script, re.S)
        self.assertIsNotNone(listed)
        in_script = set(re.findall(r"'([^']+)'", listed.group(1)))
        # The tool probes the public site with its own shorter list; every path it
        # probes must also be one the internal health script treats as live.
        self.assertTrue(set(r.PUBLIC_LIVE) <= in_script, set(r.PUBLIC_LIVE) - in_script)



class ReviewedGuideReleaseTest(unittest.TestCase):
    def test_rejects_unapproved_or_english_guides(self):
        for paths in [["/en/solutions/example"], ["/zh/solutions"], ["/zh/case/henan-annealing-solution-line"], "all"]:
            with self.subTest(paths=paths), self.assertRaises(ValueError):
                r.validate_manifest({**MANIFEST, 'approvedGuides': paths})

    def test_exact_guides_are_required_and_listed_while_other_guides_stay_private(self):
        contract = r.case_contract('open', guides=r.APPROVED_GUIDES)
        statuses = {path: 200 for path in CASE_GROUP + r.APPROVED_GUIDES}
        xml = sitemap('/zh/news', '/en/news', *CASE_GROUP, *r.APPROVED_GUIDES)
        with patch.object(r, 'run', side_effect=site(statuses, xml)):
            r.public_probe('https://example.test', contract)
        for changed, changed_xml in [({**statuses, r.APPROVED_GUIDES[0]: 404}, xml), (statuses, sitemap('/zh/news', '/en/news', *CASE_GROUP)), (statuses, sitemap('/zh/news', '/en/news', *CASE_GROUP, *r.APPROVED_GUIDES, '/en/solutions/example'))]:
            with patch.object(r, 'run', side_effect=site(changed, changed_xml)), self.assertRaises(RuntimeError):
                r.public_probe('https://example.test', contract)

    def test_preflight_and_recovery_accept_previous_closed_guide_state(self):
        contract = r.case_contract('either', guides=r.APPROVED_GUIDES, guide_state='either', encoded=False)
        with patch.object(r, 'run', side_effect=site({path: 200 for path in CASE_GROUP}, sitemap('/zh/news', '/en/news', *CASE_GROUP))):
            r.public_probe('https://example.test', contract)
        retired = r.case_contract('open', guides=[], withdrawn_guides=r.APPROVED_GUIDES)
        self.assertTrue(set(r.APPROVED_GUIDES) <= set(retired['retired']))

    def test_container_checker_uses_the_same_guide_contract(self):
        harness = HealthScriptTest()
        contract = r.case_contract('open', guides=r.APPROVED_GUIDES)
        statuses = {path: 200 for path in CASE_GROUP + r.APPROVED_GUIDES}
        xml = sitemap('/zh/news', '/en/news', *CASE_GROUP, *r.APPROVED_GUIDES)
        self.assertEqual(harness.run_script(contract, statuses, xml)[0], 0)
        self.assertNotEqual(harness.run_script(contract, {**statuses, r.APPROVED_GUIDES[0]: 404}, xml)[0], 0)
        self.assertNotEqual(harness.run_script(contract, statuses, sitemap('/zh/news', '/en/news', *CASE_GROUP))[0], 0)

class AdminReleaseTest(MockAcquisitionChecks, unittest.TestCase):
    def manifest(self):
        return {**MANIFEST, 'admin': {'image': OTHER, 'expectedCurrentImage': RECEIPT['images']['admin'],
                                    'archiveSha256': '4' * 64}}

    def test_admin_manifest_requires_immutable_image_previous_version_and_shared_source(self):
        self.assertEqual(r.validate_manifest(self.manifest()), self.manifest())
        for admin in [{}, {'image': 'latest'}, {**self.manifest()['admin'], 'archiveSha256': 'bad'},
                      {**self.manifest()['admin'], 'expectedCurrentImage': ''}]:
            with self.subTest(admin=admin), self.assertRaises(ValueError):
                r.validate_manifest({**MANIFEST, 'admin': admin})

    def test_admin_assets_reject_missing_filter_incompatible_contract_and_html_fallback(self):
        good = {'/': '<script src="/assets/index-abc.js"></script><link href="/assets/index.css">',
                '/assets/index-abc.js': 'const label="只看通知未送达";const undelivered=true;',
                '/assets/index.css': 'body{color:black}', '/inquiry-contract-version.txt': '2'}
        self.assertTrue(r.admin_assets(good.__getitem__)['passed'])
        for patch_values in [{'/': '<script src="https://other.test/app.js"></script>'},
                             {'/assets/index-abc.js': '<!DOCTYPE html><html></html>'},
                             {'/assets/index-abc.js': 'old application'},
                             {'/inquiry-contract-version.txt': '1'}]:
            with self.subTest(patch_values=patch_values), self.assertRaises(RuntimeError):
                r.admin_assets({**good, **patch_values}.__getitem__)
        previous = {**good, '/assets/index-abc.js': 'old application'}
        self.assertTrue(r.admin_assets(previous.__getitem__, require_filter=False)['passed'])
        lazy = {**good, '/assets/index-abc.js': 'import("./CustomRequirementPage-123.js")',
                '/assets/CustomRequirementPage-123.js': good['/assets/index-abc.js']}
        self.assertIn('/assets/CustomRequirementPage-123.js', r.admin_assets(lazy.__getitem__)['assets'])

    def test_admin_is_protected_without_an_explicit_manifest(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = ContractTest().fixture(tmp)
            self.assertIn('admin', release.protected)
            self.assertEqual(release.components, ['frontend'])

    def test_failed_admin_canary_never_replaces_production(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = ContractTest().fixture(tmp, self.manifest())
            with patch.object(r, 'inspect', side_effect=lambda names: [x for x in rows() if x['Name'][11:] in names]), \
                 patch.object(r, 'run', side_effect=image_inspect), \
                 patch.object(release, 'admin_check', side_effect=RuntimeError('missing filter')), \
                 patch.object(release, 'replace_frontend') as replace:
                with self.assertRaises(RuntimeError): release.execute(apply=True)
                replace.assert_not_called()
                self.assertFalse(release.pending_path.exists())

    def test_admin_version_drift_stops_before_canary(self):
        with tempfile.TemporaryDirectory() as tmp:
            value = self.manifest()
            value['admin']['expectedCurrentImage'] = NEW
            release = ContractTest().fixture(tmp, value)
            with patch.object(r, 'inspect', side_effect=lambda names: [x for x in rows() if x['Name'][11:] in names]), \
                 patch.object(r, 'run', side_effect=image_inspect), patch.object(release, 'admin_check') as check:
                with self.assertRaisesRegex(RuntimeError, 'Admin changed'): release.execute(apply=True)
                check.assert_not_called()

    def test_public_admin_mismatch_restores_both_frontend_and_admin(self):
        for fails in [False, True]:
            with self.subTest(fails=fails), tempfile.TemporaryDirectory() as tmp:
                release = ContractTest().fixture(tmp, self.manifest())
                state = dict(RECEIPT['images'])
                switches = []
                def current(names):
                    result = rows(state['frontend'])
                    for row in result:
                        name = row['Name'].removeprefix('/corp-site-')
                        if name in state:
                            row['Image'] = state[name]
                            row['Id'] = name + state[name]
                    return [row for row in result if row['Name'].removeprefix('/corp-site-') in names]
                def replace(override=None):
                    switches.append(override)
                    state.update(RECEIPT['images'] if override else release.target)
                def admin_check(container=None, require_filter=True):
                    return {'passed': True, 'assets': {'/assets/app.js': 'wrong' if fails and require_filter else 'checked'}}
                with patch.object(r, 'inspect', side_effect=current), patch.object(r, 'run', side_effect=canary_docker), \
                     patch.object(r, 'wait_healthy'), patch.object(r, 'probe', return_value=GOOD), \
                     patch.object(r, 'public_probe', return_value=[]), patch.object(r.subprocess, 'run'), \
                     patch.object(release, 'admin_check', return_value={'passed': True, 'assets': {'/assets/app.js': 'checked'}}), \
                     patch.object(r, 'admin_probe', side_effect=admin_check), \
                     patch.object(release, 'backend_check') as backend, \
                     patch.object(release, 'replace_frontend', side_effect=replace):
                    if fails:
                        with self.assertRaises(RuntimeError): release.execute(apply=True)
                    else:
                        result = release.execute(apply=True)
                        self.assertTrue(result['applied'])
                    backend.assert_not_called()
                self.assertEqual(state['backend'], RECEIPT['images']['backend'])
                self.assertFalse(release.pending_path.exists())
                receipt = json.loads(release.receipt_path.read_text())
                if fails:
                    self.assertEqual(state, RECEIPT['images'])
                    self.assertEqual(receipt, RECEIPT)
                    self.assertEqual(len(switches), 2)
                    self.assertTrue(json.loads((release.audit / 'result.json').read_text())['previousAdminRestoredAndVerified'])
                else:
                    self.assertEqual(state, release.target)
                    self.assertEqual(receipt['adminRelease']['image'], OTHER)
                    self.assertEqual(receipt['images']['admin'], OTHER)
                    self.assertEqual(json.loads(release.pins_path.read_text())['services']['admin']['image'], OTHER)



class AdminOnlyReleaseTest(unittest.TestCase):
    def manifest(self):
        return {**AdminReleaseTest().manifest(), 'image': OLD, 'adminOnly': True}

    def test_scope_rejects_frontend_or_backend_switch_and_missing_admin(self):
        valid = self.manifest()
        self.assertEqual(r.validate_manifest(valid), valid)
        for change in [{'image': NEW}, {'backend': {}}, {'adminOnly': 'true'}]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                r.validate_manifest({**valid, **change})
        value = {k: v for k, v in valid.items() if k != 'admin'}
        with self.assertRaises(ValueError): r.validate_manifest(value)

    def test_admin_only_switch_and_failed_cache_recovery_preserve_frontend_and_marker(self):
        for fails, kind in [(False, 'deploy'), (True, 'deploy'), (False, 'rollback')]:
            with self.subTest(fails=fails, kind=kind), tempfile.TemporaryDirectory() as tmp:
                receipt = copy.deepcopy(RECEIPT)
                receipt['frontendRelease'] = {'sourceCommit': '1' * 40, 'servedCases': r.APPROVED_CASES,
                                              'servedGuides': r.APPROVED_GUIDES}
                release = ContractTest().fixture(tmp, self.manifest(), receipt)
                marker = release.live / 'DEPLOY_COMMIT'
                marker.write_text('1' * 40 + '\n')
                release = r.Release(release.live, release.audit, self.manifest(), 'fixture')
                state = dict(RECEIPT['images'])
                switches = []
                def current(names):
                    result = rows()
                    for row in result:
                        name = row['Name'].removeprefix('/corp-site-')
                        if name in state:
                            row['Image'] = state[name]
                            row['Id'] = name + state[name]
                    return [row for row in result if row['Name'].removeprefix('/corp-site-') in names]
                def replace(override=None):
                    self.assertEqual(release.components, ['admin'])
                    self.assertIn('frontend', release.protected)
                    switches.append(override)
                    state['admin'] = receipt['images']['admin'] if override else OTHER
                def image(args, **kwargs):
                    self.assertEqual(args[:3], ['docker', 'image', 'inspect'])
                    source = '1' * 40 if args[-1] == OLD else MANIFEST['sourceCommit']
                    return json.dumps([{'Id': args[-1], 'Config': {'Labels': {'org.opencontainers.image.revision': source}}}])
                with patch.object(r, 'inspect', side_effect=current), patch.object(r, 'run', side_effect=image), \
                     patch.object(r, 'probe', return_value=GOOD), patch.object(r, 'public_probe', return_value=[]), \
                     patch.object(release, 'admin_check', return_value={'passed': True, 'assets': {'/assets/app.js': 'checked'}}), \
                     patch.object(r, 'admin_probe', return_value={'passed': True, 'assets': {'/assets/app.js': 'checked'}}), \
                     patch.object(r, 'admin_cache_probe', side_effect=RuntimeError('cache failed') if fails else None) as cache, \
                     patch.object(release, 'replace_frontend', side_effect=replace):
                    cache.return_value = []
                    if fails:
                        with self.assertRaises(RuntimeError): release.execute(True, kind=kind)
                    else:
                        self.assertTrue(release.execute(True, kind=kind)['applied'])
                if kind == 'rollback': cache.assert_not_called()
                self.assertEqual(state['frontend'], receipt['images']['frontend'])
                self.assertEqual(state['backend'], receipt['images']['backend'])
                after = json.loads(release.receipt_path.read_text())
                self.assertEqual(after['frontendRelease'], receipt['frontendRelease'])
                self.assertEqual(marker.read_text(), '1' * 40 + '\n')
                self.assertFalse(release.pending_path.exists())
                self.assertEqual(len(switches), 2 if fails else 1)
                self.assertEqual(state['admin'], receipt['images']['admin'] if fails else OTHER)

    def test_cache_gate_rejects_old_entry_and_soft_404(self):
        def response(args, **kwargs):
            self.assertEqual(args[3] if args[0] == 'docker' else args[0], 'curl')
            self.assertNotIn('--fail', args)
            missing = args[-1].endswith('.js')
            headers = 'HTTP/1.1 ' + ('404 Not Found' if missing else '200 OK') + '\nX-Robots-Tag: noindex, nofollow\n'
            if not missing: headers += 'Cache-Control: no-store, max-age=0\n'
            return subprocess.CompletedProcess(args, 0, headers, '')
        for container in [None, 'candidate']:
            with self.subTest(container=container), patch.object(r.subprocess, 'run', side_effect=response):
                self.assertEqual(len(r.admin_cache_probe(container)), 5)
        for headers in ['HTTP/1.1 200 OK\nX-Robots-Tag: noindex, nofollow\n',
                        'HTTP/1.1 200 OK\nCache-Control: no-store\nX-Robots-Tag: noindex, nofollow\n']:
            with patch.object(r.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0, headers, '')):
                with self.assertRaises(RuntimeError): r.admin_cache_probe()
        headers = 'HTTP/1.1 200 OK\nX-Robots-Tag: noindex, nofollow\nCache-Control: no-store\n'
        with patch.object(r.subprocess, 'run', return_value=subprocess.CompletedProcess([], 7, headers, 'connection failed')):
            with self.assertRaises(RuntimeError): r.admin_cache_probe('candidate')


class BackendOnlyReleaseTest(unittest.TestCase):
    def manifest(self):
        return {**MANIFEST, 'image': OLD, 'backendOnly': True,
                'backend': {'image': OTHER, 'expectedCurrentImage': RECEIPT['images']['backend'],
                            'archiveSha256': '8' * 64}}

    def fixture(self, tmp):
        receipt = copy.deepcopy(RECEIPT)
        receipt['frontendRelease'] = {'sourceCommit': '1' * 40, 'servedCases': r.APPROVED_CASES,
                                      'servedGuides': r.APPROVED_GUIDES}
        receipt['adminRelease'] = {'sourceCommit': '2' * 40, 'image': RECEIPT['images']['admin']}
        release = ContractTest().fixture(tmp, self.manifest(), receipt)
        (release.live / 'DEPLOY_COMMIT').write_text('1' * 40 + '\n')
        return r.Release(release.live, release.audit, self.manifest(), 'fixture')

    def image(self, args, **kwargs):
        self.assertEqual(args[:3], ['docker', 'image', 'inspect'])
        source = '1' * 40 if args[-1] == OLD else MANIFEST['sourceCommit']
        return json.dumps([{'Id': args[-1], 'Config': {'Labels': {'org.opencontainers.image.revision': source}}}])

    def test_manifest_is_explicit_mutually_exclusive_and_preserves_other_images(self):
        valid = self.manifest()
        self.assertEqual(r.validate_manifest(valid), valid)
        for change in [{'image': NEW}, {'admin': {}}, {'backendOnly': 'true'}, {'adminOnly': True}]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                r.validate_manifest({**valid, **change})
        with self.assertRaises(ValueError):
            r.validate_manifest({k: v for k, v in valid.items() if k != 'backend'})

    def test_switch_and_failure_restore_only_backend_preserving_frontend_contract_and_marker(self):
        for fails, apply, kind in [(False, True, 'deploy'), (True, True, 'deploy'),
                                   (False, False, 'deploy'), (False, True, 'rollback')]:
            with self.subTest(fails=fails, apply=apply, kind=kind), tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp)
                receipt = copy.deepcopy(release.receipt)
                state = dict(receipt['images'])
                switches = []
                checks = []
                def current(names):
                    result = rows()
                    for row in result:
                        name = row['Name'].removeprefix('/corp-site-')
                        if name in state:
                            row.update(Image=state[name], Id=name + state[name])
                    return [row for row in result if row['Name'].removeprefix('/corp-site-') in names]
                def replace(override=None):
                    self.assertEqual(release.components, ['backend'])
                    self.assertEqual(set(release.protected), {'frontend', 'admin', 'nginx', 'postgres'})
                    switches.append(override)
                    state['backend'] = receipt['images']['backend'] if override else OTHER
                def backend_check(migrate=False, running=False):
                    self.assertFalse(migrate)
                    checks.append('running' if running else 'candidate')
                    return {'passed': True, 'pendingMigrationCount': 0, 'aggregateAvailable': True}
                def public(*args):
                    self.assertEqual(args[1], release.target_contract)
                    if fails and state['backend'] == OTHER:
                        raise RuntimeError('public route failed')
                    return []
                with patch.object(r, 'inspect', side_effect=current), patch.object(r, 'run', side_effect=self.image), \
                     patch.object(r, 'probe', return_value=GOOD) as probe, patch.object(r, 'public_probe', side_effect=public), \
                     patch.object(release, 'backend_check', side_effect=backend_check), \
                     patch.object(release, 'replace_frontend', side_effect=replace), \
                     patch.object(release, 'verify_backup') as backup:
                    if fails:
                        with self.assertRaises(RuntimeError): release.execute(apply, kind=kind)
                    else:
                        result = release.execute(apply, kind=kind)
                        self.assertEqual(result['applied'], apply)
                    backup.assert_not_called()
                    self.assertTrue(all(call.args[0] == 'corp-site-frontend' for call in probe.call_args_list))
                after = json.loads(release.receipt_path.read_text())
                self.assertEqual(after['frontendRelease'], receipt['frontendRelease'])
                self.assertEqual(after['adminRelease'], receipt['adminRelease'])
                self.assertEqual((release.live / 'DEPLOY_COMMIT').read_text(), '1' * 40 + '\n')
                self.assertEqual(state['frontend'], receipt['images']['frontend'])
                self.assertEqual(state['admin'], receipt['images']['admin'])
                self.assertEqual(state['backend'], receipt['images']['backend'] if fails or not apply else OTHER)
                self.assertFalse(release.pending_path.exists())
                self.assertEqual(len(switches), 0 if not apply else 2 if fails else 1)
                self.assertEqual(checks, ['candidate'] if not apply else ['candidate', 'candidate', 'running'] + (['running'] if fails else []))
                if apply and not fails:
                    self.assertEqual(after['backendRelease'], {**self.manifest()['backend'],
                                     'sourceCommit': MANIFEST['sourceCommit'], 'sourceIdentity': 'git-commit'})
                else:
                    self.assertEqual(after, receipt)

    def test_pending_or_deferred_preflight_never_enters_migration_or_switch(self):
        for report in [{'passed': True, 'pendingMigrationCount': 1, 'aggregateAvailable': None},
                       {'passed': True, 'aggregateAvailable': True},
                       {'passed': True, 'pendingMigrationCount': 0, 'aggregateAvailable': None}]:
            with self.subTest(report=report), tempfile.TemporaryDirectory() as tmp:
                release = self.fixture(tmp)
                with patch.object(r, 'inspect', return_value=rows()), patch.object(r, 'run', side_effect=self.image), \
                     patch.object(release, 'backend_check', return_value=report), \
                     patch.object(release, 'replace_frontend') as replace, patch.object(release, 'verify_backup') as backup:
                    with self.assertRaises(RuntimeError): release.execute(True)
                    replace.assert_not_called()
                    backup.assert_not_called()
                    self.assertFalse(release.pending_path.exists())

    def test_backend_commands_forbid_migration_and_require_complete_read_only_check(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            good = {'passed': True, 'pendingMigrationCount': 0, 'aggregateAvailable': True}
            with patch.object(r, 'run', return_value=json.dumps(good)) as command:
                for running in [False, True]:
                    release.backend_check(running=running)
                    args = command.call_args.args[0]
                    self.assertIn('RELEASE_NO_MIGRATIONS=1', args)
                    self.assertIn('RELEASE_APPLY_INDEX=0', args)
                command.reset_mock()
                with self.assertRaises(RuntimeError): release.backend_check(migrate=True)
                command.assert_not_called()
            for report in [{**good, 'pendingMigrationCount': 1}, {**good, 'aggregateAvailable': None}]:
                with patch.object(r, 'run', return_value=json.dumps(report)), self.assertRaises(RuntimeError):
                    release.backend_check()

    def test_replace_command_selects_only_backend_and_reloads_existing_proxy(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = self.fixture(tmp)
            with patch.object(r, 'run', return_value='') as run, patch.object(r, 'wait_healthy') as health:
                release.replace_frontend()
            commands = [call.args[0] for call in run.call_args_list]
            self.assertEqual(len(commands), 3)
            self.assertEqual(commands[0][-7:], ['up', '-d', '--no-deps', '--no-build', '--pull', 'never', 'backend'])
            self.assertEqual(commands[1:], [['docker', 'exec', 'corp-site-nginx', 'nginx', '-t'],
                                             ['docker', 'exec', 'corp-site-nginx', 'nginx', '-s', 'reload']])
            health.assert_called_once_with('corp-site-backend')



class SeparateProcurementReleaseTest(unittest.TestCase):
    PATHS = r.APPROVED_PROCUREMENT_PATHS
    def manifest(self, paths=None):
        return {**MANIFEST, 'approvedGuides': r.APPROVED_GUIDES,
                r.SCOPE_FIELD: self.PATHS if paths is None else paths,
                'procurementApprovalSha256': r.PROCUREMENT_APPROVAL_SHA256}

    def test_exact_scope_provenance_and_old_manifest_compatibility(self):
        self.assertEqual(r.validate_manifest(self.manifest())[r.SCOPE_FIELD], self.PATHS)
        self.assertEqual(r.validate_manifest(MANIFEST), MANIFEST)
        self.assertEqual(len(r.APPROVED_GUIDES), 11)
        self.assertNotIn(self.PATHS[0], r.APPROVED_GUIDES)
        for value in [['/zh/articles/third'], ['/en/service/industrial-furnace-parts-purchasing'],
                      [self.PATHS[0] + ' '], self.PATHS * 2, [{'path': self.PATHS[0]}], 'all']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                r.validate_manifest(self.manifest(value))
        for approval in [None, '0' * 64, {'approved': True}]:
            bad = self.manifest()
            if approval is None: bad.pop('procurementApprovalSha256')
            else: bad['procurementApprovalSha256'] = approval
            with self.subTest(approval=approval), self.assertRaises(ValueError): r.validate_manifest(bad)

    def test_tampered_registry_and_source_body_cannot_create_approval(self):
        import procurement_approval as approval
        root = Path(__file__).resolve().parents[2]
        with tempfile.TemporaryDirectory() as tmp:
            fake = Path(tmp) / 'approval.json'
            changed = approval.approval_document();changed['pages'][1]['h1'] = '未经确认的页面'
            fake.write_text(json.dumps(changed, ensure_ascii=False))
            with patch.object(approval, 'APPROVAL_FILE', fake), self.assertRaises(ValueError):
                approval.normalize_procurement(self.PATHS)
            fake_root = Path(tmp) / 'project'
            for relative in ['frontend/src/lib/approved-procurement-pages.ts', 'frontend/src/lib/publication-scope.ts',
                             'frontend/src/app/[locale]/articles/special-industrial-furnace-procurement-assessment/page.tsx',
                             'frontend/src/app/[locale]/service/industrial-furnace-parts-purchasing/page.tsx']:
                output = fake_root / relative;output.parent.mkdir(parents=True, exist_ok=True);output.write_bytes((root / relative).read_bytes())
            self.assertEqual(approval.procurement_candidate_fields(fake_root)[r.SCOPE_FIELD], self.PATHS)
            body_file = fake_root / 'frontend/src/lib/approved-procurement-pages.ts'
            body_file.write_text(body_file.read_text().replace('苏能接受工业炉配件的独立采购需求', '未经批准的新内容', 1))
            with self.assertRaises(ValueError): approval.procurement_candidate_fields(fake_root)

    def test_source_and_both_actual_prepare_metadata_blocks_carry_exact_scope(self):
        from procurement_approval import procurement_candidate_fields
        root = Path(__file__).resolve().parents[2]
        self.assertEqual(procurement_candidate_fields(root)[r.SCOPE_FIELD], self.PATHS)
        for workflow, component in [('prepare-frontend.yml', None), ('prepare-release.yml', 'frontend'), ('prepare-release.yml', 'backend')]:
            text = (root / '.github/workflows' / workflow).read_text()
            source = text.split("          python3 - <<'PY'\n", 1)[1].split('\n          PY', 1)[0]
            source = '\n'.join(line[10:] for line in source.splitlines())
            with self.subTest(workflow=workflow, component=component), tempfile.TemporaryDirectory() as tmp:
                folder = Path(tmp) / ('release-' + component if component else 'frontend-candidate');folder.mkdir()
                (folder / ((component or 'frontend') + '.tar.gz')).write_bytes(b'fixture-not-an-image')
                (folder / 'image.json').write_text(json.dumps([{'Id': NEW, 'RootFS': {'Layers': []}, 'Size': 10}]))
                env = {**os.environ, 'RUNNER_TEMP': tmp, 'SOURCE_COMMIT': 'e'*40, 'IMAGE_TAG': 'fixture'}
                if component: env['COMPONENT'] = component
                result = subprocess.run([sys.executable, '-c', source], cwd=root, env=env, capture_output=True, text=True, timeout=15)
                self.assertEqual(result.returncode, 0, result.stderr)
                actual = json.loads((folder / 'candidate.json').read_text())
                if component != 'backend':
                    self.assertEqual(actual['approvedGuides'], r.APPROVED_GUIDES)
                    self.assertEqual(actual[r.SCOPE_FIELD], self.PATHS)
                    self.assertEqual(actual['procurementApprovalSha256'], r.PROCUREMENT_APPROVAL_SHA256)
                else:
                    self.assertNotIn(r.SCOPE_FIELD, actual)
                    self.assertNotIn('approvedGuides', actual)
                    self.assertNotIn('htmlCachePolicy', actual)

    def test_prepared_scope_is_not_evidence_candidate_is_serving_the_pages(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = ContractTest().fixture(tmp, self.manifest())
            with patch.object(r, 'working_space', return_value={'passed': True}), \
                 patch.object(r, 'inspect', side_effect=lambda names: [x for x in rows() if x['Name'][11:] in names]), \
                 patch.object(r, 'run', side_effect=canary_docker), patch.object(r, 'wait_healthy'), \
                 patch.object(r, 'probe', return_value=GOOD), patch.object(r.subprocess, 'run'), \
                 patch.object(r, 'approved_procurement_probe', return_value={'passed': False, 'pagesChecked': 2}), \
                 patch.object(release, 'replace_frontend') as switch:
                with self.assertRaisesRegex(RuntimeError, 'continuity'): release.execute(apply=True)
                switch.assert_not_called()
                self.assertEqual(json.loads(release.receipt_path.read_text()), RECEIPT)

    def perform(self, tmp, *, previous=None, paths=None, failure=None, apply=True, kind='deploy', same=False):
        receipt = copy.deepcopy(RECEIPT)
        if previous is not None:
            # The actually published 4edd wrapper records these exact paths without a later schema hash.
            receipt['frontendRelease'] = {r.SCOPE_FIELD: previous, 'servedGuides': r.APPROVED_GUIDES}
        manifest = self.manifest(paths)
        if same: manifest['image'] = OLD
        release = ContractTest().fixture(tmp, manifest, receipt)
        state = {'image': OLD, 'switches': []}
        def current(names): return [x for x in rows(state['image']) if x['Name'][11:] in names]
        def replace(override=None):
            state['switches'].append(override);state['image'] = OLD if override else NEW
        count = {'n': 0}
        def check(container, checked, public=False):
            count['n'] += 1
            return {'passed': failure != ('public' if public else 'candidate') and not (failure == 'public-once' and count['n'] == 2), 'pagesChecked': len(checked)}
        with patch.object(r, 'working_space', return_value={'passed': True}), patch.object(r, 'inspect', side_effect=current), \
             patch.object(r, 'run', side_effect=canary_docker), patch.object(r, 'wait_healthy'), patch.object(r, 'probe', return_value=GOOD), \
             patch.object(r, 'public_probe', return_value=[]), patch.object(r.subprocess, 'run'), \
             patch.object(release, 'replace_frontend', side_effect=replace), \
             patch.object(r, 'acquisition_continuity_probe', return_value={'passed': True, 'pagesChecked': 11}), \
             patch.object(r, 'approved_procurement_probe', side_effect=check) as gate:
            if failure:
                with self.assertRaises(RuntimeError): release.execute(apply=apply, kind=kind)
                result = None
            else: result = release.execute(apply=apply, kind=kind)
        return release, state, gate.call_args_list, result, receipt

    def test_new_public_receipt_preserves_two_page_scope_and_actual_checks(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, state, calls, result, _ = self.perform(tmp, previous=self.PATHS)
            self.assertEqual(state['image'], NEW)
            self.assertEqual([c.kwargs['public'] for c in calls], [False, True])
            saved = json.loads(release.receipt_path.read_text())['frontendRelease']
            self.assertEqual(saved[r.SCOPE_FIELD], sorted(self.PATHS))
            self.assertEqual(saved['procurementApprovalSha256'], r.PROCUREMENT_APPROVAL_SHA256)
            self.assertEqual(saved['servedGuides'], sorted(r.APPROVED_GUIDES))
            self.assertTrue(result['candidateApprovedProcurement']['passed'])
            self.assertTrue(result['publicApprovedProcurement']['passed'])

    def test_public_body_failure_restores_original_scope_and_receipt(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, state, _, _, original = self.perform(tmp, previous=[], failure='public')
            self.assertEqual(state['image'], OLD)
            self.assertEqual(len(state['switches']), 2)
            self.assertEqual(json.loads(release.receipt_path.read_text()), original)
            self.assertTrue(json.loads((release.audit/'result.json').read_text())['previousFrontendRestoredAndVerified'])

    def test_recovery_rechecks_the_previous_two_actual_bodies(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, state, calls, _, original = self.perform(tmp, previous=self.PATHS, failure='public-once')
            self.assertEqual(state['image'], OLD)
            self.assertEqual([c.kwargs['public'] for c in calls], [False, True, True])
            self.assertEqual(calls[-1].args[1], sorted(self.PATHS))
            result = json.loads((release.audit / 'result.json').read_text())
            self.assertTrue(result['previousApprovedProcurement']['passed'])
            self.assertTrue(result['previousFrontendRestoredAndVerified'])
            self.assertEqual(json.loads(release.receipt_path.read_text()), original)

    def test_old_image_rollback_closes_two_pages_instead_of_reusing_new_scope(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, _, calls, _, _ = self.perform(tmp, previous=self.PATHS, paths=[], kind='rollback')
            self.assertEqual(calls, [])
            self.assertEqual(release.target_contract['procurement']['paths'], [])
            self.assertEqual(release.lenient_contract['procurement']['paths'], sorted(self.PATHS))
            self.assertTrue(all(p in release.target_contract['retired'] for p in self.PATHS))
            self.assertEqual(json.loads(release.receipt_path.read_text())['frontendRelease'][r.SCOPE_FIELD], [])

    def test_rollback_to_supported_image_still_checks_actual_two_bodies(self):
        with tempfile.TemporaryDirectory() as tmp:
            _, _, calls, _, _ = self.perform(tmp, previous=self.PATHS, kind='rollback')
            self.assertEqual([c.kwargs['public'] for c in calls], [False, True])

    def test_same_image_and_preflight_keep_actual_scope_distinct(self):
        for same in [False, True]:
            with self.subTest(same=same), tempfile.TemporaryDirectory() as tmp:
                release, state, calls, result, original = self.perform(tmp, previous=self.PATHS, apply=False, same=same)
                self.assertEqual([c.kwargs['public'] for c in calls], [False, True])
                self.assertEqual(state['switches'], [])
                self.assertFalse(result['applied'])
                self.assertEqual(json.loads(release.receipt_path.read_text()), original)

    def test_component_only_release_keeps_previous_scope(self):
        manifest = {**MANIFEST, 'image': OLD, 'backendOnly': True,
                    'backend': {'image': NEW, 'expectedCurrentImage': RECEIPT['images']['backend'], 'archiveSha256': 'f'*64}}
        receipt = copy.deepcopy(RECEIPT);receipt['frontendRelease']={r.SCOPE_FIELD: self.PATHS}
        with tempfile.TemporaryDirectory() as tmp:
            release = ContractTest().fixture(tmp, manifest, receipt)
            self.assertEqual(release.served_procurement, sorted(self.PATHS))
            self.assertEqual(release.target_contract['procurement']['paths'], sorted(self.PATHS))

    def test_previous_forged_or_unverified_scope_cannot_be_used_as_approval(self):
        for previous in [{r.SCOPE_FIELD:['/zh/articles/third']}, {r.SCOPE_FIELD:self.PATHS, r.SCOPE_FIELD+'Unverified':True},
                         {r.SCOPE_FIELD:self.PATHS, 'procurementApprovalSha256':'0'*64}]:
            receipt={**RECEIPT,'frontendRelease':previous}
            with self.subTest(previous=previous), tempfile.TemporaryDirectory() as tmp, self.assertRaises(ValueError):
                ContractTest().fixture(tmp, self.manifest(), receipt)

    def test_true_retired_path_and_unapproved_alternates_stay_rejected(self):
        contract = r.case_contract('open', guides=r.APPROVED_GUIDES, procurement=self.PATHS)
        statuses={p:200 for p in CASE_GROUP+r.APPROVED_GUIDES+self.PATHS}
        xml=sitemap('/zh/news','/en/news',*CASE_GROUP,*r.APPROVED_GUIDES,*self.PATHS)
        with patch.object(r,'run',side_effect=site(statuses,xml)): r.public_probe('https://example.test',contract)
        for bad in ['/en/service/industrial-furnace-parts-purchasing','/zh/articles/third',self.PATHS[0]+'?approved=true',self.PATHS[1]+'#fake']:
            changed=sitemap('/zh/news','/en/news',*CASE_GROUP,*r.APPROVED_GUIDES,*self.PATHS,alternates=[bad])
            with self.subTest(bad=bad), patch.object(r,'run',side_effect=site(statuses,changed)), self.assertRaises(RuntimeError):
                r.public_probe('https://example.test',contract)
        with patch.object(r,'run',side_effect=site({**statuses,'/zh/solutions':200},xml)), self.assertRaisesRegex(RuntimeError,'/zh/solutions'):
            r.public_probe('https://example.test',contract)

    def test_real_internal_health_requires_separate_pages_and_preserves_retirement(self):
        fixture=HealthScriptTest();contract=r.case_contract('open',guides=r.APPROVED_GUIDES,procurement=self.PATHS)
        statuses={p:200 for p in CASE_GROUP+r.APPROVED_GUIDES+self.PATHS}
        xml=sitemap('/zh/news','/en/news',*CASE_GROUP,*r.APPROVED_GUIDES,*self.PATHS)
        code,report,_=fixture.run_script(contract,statuses,xml)
        self.assertEqual(code,0);self.assertTrue(report['passed'])
        for bad in [{**statuses,self.PATHS[1]:404},{**statuses,'/zh/solutions':200}]:
            with self.subTest(bad=bad): self.assertNotEqual(fixture.run_script(contract,bad,xml)[0],0)
        self.assertNotEqual(fixture.run_script(contract,statuses,sitemap('/zh/news','/en/news',*CASE_GROUP,*r.APPROVED_GUIDES,*self.PATHS,alternates=['/en/articles/special-industrial-furnace-procurement-assessment']))[0],0)


class SeparateProcurementHttpTest(unittest.TestCase):
    def actual_check(self, fault=None):
        import approved_procurement_continuity as a
        from procurement_approval import approval_document
        project=Path(__file__).resolve().parents[2]
        raw=(project/'frontend/src/lib/approved-procurement-pages.ts').read_text()
        source=json.loads(raw.split('export const approvedProcurementPages = ',1)[1].split(' as const;',1)[0])
        pages=approval_document()['pages'];target=pages[1]['path'];requests=[]
        class Handler(BaseHTTPRequestHandler):
            def log_message(self,*args):pass
            def do_GET(self):
                requests.append(self.path);status=200;headers={};content='text/html'
                if self.path=='/sitemap.xml':
                    body=sitemap(*[p['path'] for p in pages if not (fault=='sitemap' and p['path']==target)]).replace('https://example.test',a.PUBLIC_ORIGIN);content='application/xml'
                elif self.path in [p['entryPath'] for p in pages]:
                    p=next(p for p in pages if p['entryPath']==self.path)
                    body='' if fault=='entry' and p['path']==target else '<a href="'+p['path']+'">采购入口</a>'
                elif self.path in [p['path'] for p in pages]:
                    p=next(p for p in pages if p['path']==self.path);changed=self.path==target
                    item=next(s for s in source.values() if s['path']==p['path']);html=item['html']
                    if changed and fault=='body':html=html.replace('苏能接受','苏能不接受',1)
                    if changed and fault=='missing-anchor':html=html.replace('id="'+p['anchors'][0]+'"','')
                    if changed and fault=='hidden-body':html='<div hidden>'+html+'</div>'
                    h1='其他厂家配件' if changed and fault=='h1' else p['h1']
                    canonical=a.PUBLIC_ORIGIN+('/zh/products' if changed and fault=='canonical' else p['path'])
                    toolbar='' if changed and fault=='contact' else '<nav data-contact-toolbar><a href="tel:13052986814">电话联系</a><button aria-haspopup="dialog">微信联系</button></nav>'
                    body='<html><head><link rel="canonical" href="'+canonical+'">'+('<meta name="robots" content="noindex">' if changed and fault=='noindex' else '')+'</head><body><main><h1>'+h1+'</h1><div id="'+p['bodyId']+'"><div>'+html+'</div></div></main>'+toolbar+'<footer>130-5298-6814</footer></body></html>'
                    if changed and fault=='wrong-phone':body=body.replace('tel:13052986814','tel:13000000000')
                    if changed and fault=='disabled-phone':body=body.replace('<a href="tel:13052986814"','<a aria-disabled="true" href="tel:13052986814"')
                    if changed and fault=='disabled-wechat':body=body.replace('<button aria-haspopup="dialog"','<button disabled aria-haspopup="dialog"')
                    if changed and fault=='hidden-contact':body=body.replace('<nav data-contact-toolbar','<nav hidden data-contact-toolbar')
                    if changed and fault=='phone-script-only':body=body.replace('<footer>130-5298-6814</footer>','<script>const phone="13052986814"</script>')
                    if changed and fault=='hidden-phone':body=body.replace('<footer>130-5298-6814</footer>','<footer hidden>130-5298-6814</footer>')
                    if changed and fault=='duplicate-anchor':body+='<div id="'+p['anchors'][0]+'"></div>'
                    if changed and fault=='404':status=404
                    if changed and fault=='redirect':status=302;headers['Location']='/zh/products'
                    if changed and fault=='header-noindex':headers['X-Robots-Tag']='noindex'
                else:status=404;body=''
                self.send_response(status);self.send_header('Content-Type',content)
                for k,v in headers.items():self.send_header(k,v)
                self.end_headers();self.wfile.write(body.encode())
            def do_POST(self):raise AssertionError('No contact/form actions allowed')
        server=ThreadingHTTPServer(('127.0.0.1',0),Handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        base='http://127.0.0.1:'+str(server.server_port);real_run=subprocess.run
        def transport(command,**kwargs):
            self.assertEqual(command,['docker','exec','-i','candidate','node','-'])
            return real_run(['node','-'],**kwargs)
        try:
            with patch.object(a,'CANDIDATE_ORIGIN',base),patch.object(a.subprocess,'run',side_effect=transport):
                report=a.approved_procurement_probe('candidate',r.APPROVED_PROCUREMENT_PATHS)
            self.assertEqual(len(requests),5)
            self.assertTrue(all(p in [x['path'] for x in pages]+[x['entryPath'] for x in pages]+['/sitemap.xml'] for p in requests))
            return report
        finally:server.shutdown();server.server_close();thread.join()

    def test_actual_captured_ssr_bodies_and_contact_markup_pass(self):
        fixture = Path(__file__).with_name('fixtures') / 'approved-procurement-real-ssr.json'
        script = r"""
        const fs = require('node:fs');
        const checker = require('./ops/releases/approved-procurement-continuity.cjs');
        const approval = require('./ops/releases/approved-procurement-pages.json');
        const fixtures = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
        const results = fixtures.pages.map((fixture, i) => checker.inspectApprovedPage(fixture.html, approval.pages[i], {}));
        console.log(JSON.stringify(results));
        process.exitCode = results.every(result => Object.values(result.checks).every(Boolean)) ? 0 : 1;
        """
        result = subprocess.run(['node', '-e', script, str(fixture)], cwd=Path(__file__).resolve().parents[2], capture_output=True, text=True, timeout=15)
        self.assertEqual(result.returncode, 0, result.stderr)
        rows = json.loads(result.stdout)
        self.assertEqual(len(rows), 2)
        self.assertTrue(all(row['checks']['body'] and row['checks']['contactToolbar'] and row['checks']['anchors'] for row in rows))

    def test_complete_real_http_body_fingerprints_and_nine_anchors_pass(self):
        report=self.actual_check();self.assertTrue(report['passed']);self.assertEqual(report['pagesChecked'],2)

    def test_real_two_page_faults_never_count_as_success(self):
        for fault,check in [('404','http'),('redirect','http'),('body','body'),('hidden-body','body'),('h1','h1'),('canonical','canonical'),
                            ('noindex','indexable'),('header-noindex','indexable'),('contact','contactToolbar'),('wrong-phone','contactToolbar'),('disabled-phone','contactToolbar'),('disabled-wechat','contactToolbar'),('hidden-contact','contactToolbar'),('phone-script-only','contactToolbar'),('hidden-phone','contactToolbar'),('missing-anchor','anchors'),('duplicate-anchor','anchors'),('sitemap','sitemap'),('entry','entry')]:
            with self.subTest(fault=fault):
                report=self.actual_check(fault);self.assertFalse(report['passed'])
                self.assertFalse(next(p for p in report['pages'] if p['path']==r.APPROVED_PROCUREMENT_PATHS[1])['checks'][check]['passed'])

    def test_forged_success_or_wrong_scope_is_rejected(self):
        import approved_procurement_continuity as a
        from procurement_approval import approval_document
        document=approval_document();rows=[]
        for p in document['pages']:
            rows.append({'path':p['path'],'status':200,'passed':True,'contentStreamSha256':p['contentStreamSha256'],
                         'checks':{k:{'passed':True} for k in a.REQUIRED}})
        good={'baseUrl':a.CANDIDATE_ORIGIN,'canonicalOrigin':a.PUBLIC_ORIGIN,'pagesChecked':2,'passed':True,'pages':rows}
        for fault in ['wrong-path','body','contact','missing']:
            value=copy.deepcopy(good)
            if fault=='wrong-path':value['pages'][1]['path']='/zh/articles/third'
            if fault=='body':value['pages'][1]['contentStreamSha256']='0'*64
            if fault=='contact':value['pages'][1]['checks']['contactToolbar']['passed']=False
            if fault=='missing':value['pages'].pop()
            with self.subTest(fault=fault),patch.object(a.subprocess,'run',return_value=subprocess.CompletedProcess([],0,stdout=json.dumps(value))),self.assertRaises(RuntimeError):
                a.approved_procurement_probe('candidate',r.APPROVED_PROCUREMENT_PATHS)


if __name__ == '__main__':
    unittest.main(verbosity=2)



class ProcurementContinuityReleaseTest(unittest.TestCase):
    def perform(self, tmp, failure=None, apply=True, kind='deploy', same=False):
        manifest = {**MANIFEST, 'approvedGuides': r.APPROVED_GUIDES,
                    **({'image': OLD} if same else {})}
        release = ContractTest().fixture(tmp, manifest)
        state = {'image': OLD, 'switches': []}
        original_receipt = release.receipt_path.read_bytes()
        def current(names):
            return [row for row in rows(state['image']) if row['Name'].removeprefix('/corp-site-') in names]
        def replace(override=None):
            state['switches'].append(override)
            state['image'] = OLD if override else NEW
        def check(container, public=False):
            self.assertEqual(state['image'], NEW if public else OLD)
            return {'passed': failure != ('public' if public else 'candidate'), 'pagesChecked': 11,
                    'failedPages': int(failure == ('public' if public else 'candidate')),
                    'failedCheck': 'contactToolbar' if failure else None}
        with patch.object(r, 'inspect', side_effect=current), patch.object(r, 'run', side_effect=canary_docker), \
             patch.object(r, 'wait_healthy'), patch.object(r, 'probe', return_value=GOOD), \
             patch.object(r, 'public_probe', return_value=[]), patch.object(r.subprocess, 'run'), \
             patch.object(release, 'replace_frontend', side_effect=replace), \
             patch.object(r, 'acquisition_continuity_probe', side_effect=check) as gate:
            if failure:
                with self.assertRaises(RuntimeError): release.execute(apply=apply, kind=kind)
                result = None
            else:
                result = release.execute(apply=apply, kind=kind)
        return release, state, gate.call_args_list, result, original_receipt

    def test_missing_candidate_contact_refuses_switch_even_if_other_status_checks_pass(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, state, calls, _, original = self.perform(tmp, failure='candidate')
            self.assertEqual(state['switches'], [])
            self.assertEqual(len(calls), 1)
            self.assertFalse(json.loads((release.audit / 'candidate-acquisition.json').read_text())['passed'])
            self.assertEqual(release.receipt_path.read_bytes(), original)
            self.assertFalse(release.pending_path.exists())
            self.assertFalse((release.audit / 'result.json').exists())

    def test_missing_new_public_contact_restores_previous_frontend_and_receipt(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, state, calls, _, original = self.perform(tmp, failure='public')
            self.assertEqual(state['image'], OLD)
            self.assertEqual(len(state['switches']), 2)
            self.assertEqual([c.kwargs['public'] for c in calls], [False, True])
            self.assertFalse(json.loads((release.audit / 'public-acquisition.json').read_text())['passed'])
            result = json.loads((release.audit / 'result.json').read_text())
            self.assertFalse(result['passed'])
            self.assertTrue(result['previousFrontendRestoredAndVerified'])
            self.assertEqual(json.loads(release.receipt_path.read_text()), json.loads(original))
            self.assertFalse(release.pending_path.exists())

    def test_new_frontend_requires_candidate_and_post_switch_public_receipts(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, state, calls, result, _ = self.perform(tmp)
            self.assertEqual(state['image'], NEW)
            self.assertEqual([c.kwargs['public'] for c in calls], [False, True])
            self.assertTrue(calls[0].args[0].startswith('suneng-release-check-'))
            self.assertEqual(calls[1].args[0], 'corp-site-frontend')
            self.assertTrue(result['candidateAcquisition']['passed'])
            self.assertTrue(result['publicAcquisition']['passed'])
            self.assertTrue((release.audit / 'candidate-acquisition.json').exists())
            self.assertTrue((release.audit / 'public-acquisition.json').exists())

    def test_dry_run_only_checks_candidate_not_yet_published_target(self):
        with tempfile.TemporaryDirectory() as tmp:
            release, state, calls, result, original = self.perform(tmp, apply=False)
            self.assertEqual([c.kwargs['public'] for c in calls], [False])
            self.assertEqual(state['switches'], [])
            self.assertFalse(result['applied'])
            self.assertNotIn('publicAcquisition', result)
            self.assertEqual(release.receipt_path.read_bytes(), original)

    def test_same_frontend_and_rollback_do_not_impose_new_contract_on_old_image(self):
        for options in [{'same': True}, {'kind': 'rollback'}]:
            with self.subTest(options=options), tempfile.TemporaryDirectory() as tmp:
                _, _, calls, _, _ = self.perform(tmp, **options)
                self.assertEqual(calls, [])

    def test_backend_only_and_admin_only_keep_their_own_existing_contracts(self):
        with patch.object(r, 'acquisition_continuity_probe', side_effect=AssertionError('must not check unchanged frontend')) as gate:
            BackendOnlyReleaseTest().test_switch_and_failure_restore_only_backend_preserving_frontend_contract_and_marker()
            AdminOnlyReleaseTest().test_admin_only_switch_and_failed_cache_recovery_preserve_frontend_and_marker()
        gate.assert_not_called()
