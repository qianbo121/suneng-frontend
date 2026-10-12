#!/usr/bin/env python3
"""A bound frontend release entry. Reuses maintained gates; never retries apply."""
import argparse
import contextlib
import io
import json
from pathlib import Path
import subprocess

import archive_identity
import browser_capture_guard as guard
import phase_runtime
import release_browser
import release_candidate
import release_contract as contract


STEPS = ('archive', 'focused-candidate', 'capture-candidate', 'candidate', 'preflight', 'apply',
         'focused-production', 'capture-production', 'production', 'recovery-input', 'recovery', 'pack')
INPUTS = {
    'archive': ('candidate', 'archive'),
    'candidate': ('plan', 'candidateReport'),
    'focused-candidate': ('plan', 'releaseConfig', 'candidateIdentity'),
    'focused-production': ('plan', 'releaseConfig', 'productionIdentity'),
    'capture-candidate': ('plan', 'releaseConfig', 'candidateIdentity'),
    'capture-production': ('plan', 'releaseConfig', 'productionIdentity'),
    'preflight': ('manifest', 'preparationBaseline'),
    'apply': ('manifest', 'preparationBaseline'),
    'production': ('plan', 'productionReport', 'interactionReport'),
    'recovery-input': ('recoveryInput',),
    'recovery': ('recoveryInput', 'recoveryReport'),
    'pack': ('plan', 'candidateReport', 'productionReport', 'interactionReport'),
}
DEPENDENCIES = {'candidate': ('archive',), 'preflight': ('candidate',),
                'focused-candidate': ('archive',), 'capture-candidate': ('archive',),
                'focused-production': ('apply',), 'capture-production': ('apply',),
                'apply': ('archive', 'candidate', 'preflight'),
                'production': ('apply',), 'recovery': ('production', 'recovery-input'),
                'pack': ('candidate', 'production', 'recovery')}


def directory(value):
    path = Path(value).absolute()
    contract.need('..' not in path.parts and path.is_dir() and
                  not any(p.is_symlink() for p in (path, *path.parents)), 'safe-existing-root-required')
    return path


def relative(value):
    contract.need(isinstance(value, str) and bool(value), 'input-path-required')
    return guard.relative(value)


class Entry:
    def __init__(self, config, expected):
        self.config_path, self.config_sha = Path(config).absolute(), expected
        self.config = contract.read_bound(self.config_path, expected)
        contract.need(set(self.config) <= {'schemaVersion', 'root', 'sourceCommit', 'components', 'inputs',
                      'captureBudget', 'live', 'auditRoot', 'failureWebhookFile'}, 'unknown-entry-options')
        contract.required(self.config, ('schemaVersion', 'root', 'sourceCommit', 'inputs'))
        contract.need(type(self.config['schemaVersion']) is int and self.config['schemaVersion'] == 1,
                      'entry-version-required')
        self.root = directory(self.config['root'])
        self.source = self.config['sourceCommit']
        contract.need(isinstance(self.source, str) and guard.SOURCE.fullmatch(self.source), 'source-required')
        self.components = self.config.get('components', ['frontend'])
        contract.need(self.components == ['frontend'], 'entry-v1-selects-frontend-only')
        contract.required(self.config['inputs'], ('candidate', 'archive', 'plan', 'manifest'))
        contract.need(set(self.config['inputs']) <= {name for names in INPUTS.values() for name in names}
                      | {'previewDeclaration'}, 'unknown-input-role')
        for name, descriptor in self.config['inputs'].items():
            contract.required(descriptor, ('path', 'sha256'))
            relative(descriptor['path'])
            contract.need(isinstance(descriptor['sha256'], str) and
                          guard.SHA.fullmatch(descriptor['sha256']), 'input-digest-required')
        contract.need(self.descriptor('plan')['path'] == 'plan.json', 'fixed-plan-path-required')
        candidate, plan, manifest = (self.read(name) for name in ('candidate', 'plan', 'manifest'))
        contract.need(all(v.get('sourceCommit') == self.source for v in (candidate, plan, manifest)),
                      'source-inputs-disagree')
        image = plan.get('runtimeImage')
        contract.need(isinstance(image, str) and guard.IMAGE.fullmatch(image) and
                      manifest.get('image') == image, 'image-inputs-disagree')
        contract.need(candidate.get('component', 'frontend') == 'frontend', 'candidate-selects-other-components')
        self.image = image
        contract.need(candidate.get('archiveSha256') == self.descriptor('archive')['sha256'],
                      'archive-inputs-disagree')
        contract.need(not manifest.get('backendOnly') and not manifest.get('adminOnly') and
                      not manifest.get('backend') and not manifest.get('admin'), 'manifest-selects-other-components')
        self.identity = {'sourceCommit': self.source, 'components': self.components,
                         'inputs': {n: self.descriptor(n) for n in ('candidate', 'archive', 'plan', 'manifest')},
                         'nativeOptions': {'live': self.config.get('live', '/opt/website'),
                             'auditRoot': self.config.get('auditRoot', '/data/migration-rehearsals/release-ops'),
                             'failureWebhookFile': self.config.get('failureWebhookFile')}}
        self.state = self.root / 'entry'

    def descriptor(self, name):
        contract.required(self.config['inputs'], (name,))
        return self.config['inputs'][name]

    def path(self, name):
        return self.root / relative(self.descriptor(name)['path'])

    def read(self, name):
        return contract.read_bound(self.path(name), self.descriptor(name)['sha256'])

    def checked(self, step):
        contract.need(step in STEPS, 'unknown-step')
        for name in INPUTS[step]:
            if name == 'archive':
                guard.regular(self.path(name))
            else:
                self.read(name)
        if step in ('candidate', 'pack') and 'previewDeclaration' in self.config['inputs']:
            self.read('previewDeclaration')
        if step in ('preflight', 'apply'):
            baseline = self.read('preparationBaseline')
            contract.required(baseline, ('schemaVersion', 'manifestSha256', 'live', 'snapshot'))
            contract.required(baseline['snapshot'], ('containers',))
        if step in ('recovery-input', 'recovery'):
            recovery = self.read('recoveryInput')
            contract.check_recovery_input(recovery, self.source)
            current = next(v for v in recovery['frontendVersions'] if v['role'] == 'current')
            contract.need(current['runtimeImage'] == self.image and
                          current['archiveSha256'] == self.descriptor('archive')['sha256'] and
                          current['archiveBytes'] == self.read('candidate')['archiveBytes'],
                          'recovery-does-not-match-current-candidate')
        if step == 'recovery':
            contract.check_recovery_report(self.read('recoveryReport'), self.read('recoveryInput'),
                                           self.descriptor('recoveryInput')['sha256'])
        budget = contract.fresh_context_budget(**self.config.get('captureBudget', {}))
        if step.startswith(('capture-', 'focused-')):
            contract.need(self.descriptor('releaseConfig')['path'] == 'release-config.json',
                          'fixed-release-config-path-required')
            release_config = self.read('releaseConfig')
            contract.need(release_config.get('sourceCommit') == self.source and
                          isinstance(release_config.get('sourceWorktree'), str), 'capture-source-required')
        return {'inputComplete': True, 'step': step, 'sourceCommit': self.source,
                'freshContextBudgetMs': budget, 'productionChanged': False, 'releaseAccepted': False}

    def stage_identity(self, step):
        names = list(INPUTS[step])
        if step in ('candidate', 'pack') and 'previewDeclaration' in self.config['inputs']:
            names.append('previewDeclaration')
        if step in ('preflight', 'apply'):
            names.extend(('candidateReport',))
            if 'previewDeclaration' in self.config['inputs']:
                names.append('previewDeclaration')
        value = {'release': self.identity, 'step': step,
                 'inputs': {n: self.descriptor(n) for n in names}}
        if step.startswith(('capture-', 'focused-')):
            value['captureBudget'] = self.config.get('captureBudget', {})
        return value

    def stage_directory(self, step):
        # Apply always has one directory, even if newly added evidence differs.
        suffix = 'operation' if step == 'apply' else phase_runtime.digest(self.stage_identity(step))[:24]
        path = self.state / step / suffix
        contract.need(not any(p.is_symlink() for p in (path, *path.parents)), 'symlink-state-refused')
        return path

    def prerequisite(self, step):
        path = self.stage_directory(step)
        state = phase_runtime.status(path)
        contract.need(bool(state['attempts']) and state['attempts'][-1]['status'] == 'succeeded',
                      'required-step-not-successful: ' + step)
        binding = guard.load(path / 'operation.json')
        contract.need(binding == {'schemaVersion': 1, 'identitySha256':
                                  phase_runtime.digest(self.stage_identity(step))}, 'step-binding-changed')
        self.checked(step)

    def _browser(self, phase):
        role = 'candidateReport' if phase == 'candidate' else 'productionReport'
        preview = self.descriptor('previewDeclaration')['sha256'] if (
            phase == 'candidate' and 'previewDeclaration' in self.config['inputs']) else None
        if preview is not None:
            contract.need(self.descriptor('previewDeclaration')['path'] ==
                          'browser/candidate-preview-contract.json', 'fixed-preview-declaration-path-required')
        report = release_browser.validate(self.root, self.descriptor(role)['path'], phase,
                 plan_sha256=self.descriptor('plan')['sha256'], report_sha256=self.descriptor(role)['sha256'],
                 preview_sha256=preview)
        reports = [report]
        if phase == 'production':
            reports.append(release_browser.validate_interactions(self.root,
                self.descriptor('interactionReport')['path'], plan_sha256=self.descriptor('plan')['sha256'],
                report_sha256=self.descriptor('interactionReport')['sha256']))
            applied_at = self.applied_at()
            for value in reports:
                identity = guard.load(self.root / relative(value['identityBefore']))
                contract.need(contract.moment(identity['checkedAtUtc']) >= applied_at,
                              'production-captures-predate-this-apply')
        return reports

    def applied_at(self):
        state = phase_runtime.status(self.stage_directory('apply'))
        contract.need(bool(state['attempts']) and state['attempts'][-1]['status'] == 'succeeded',
                      'successful-apply-required')
        return contract.moment(state['attempts'][-1]['endedAt'])

    def execute(self, step, attempt):
        if step == 'archive':
            result = archive_identity.verify_archive(self.path('candidate'), self.path('archive'),
                candidate_sha256=self.descriptor('candidate')['sha256'], expected_source_commit=self.source)
            contract.need(result['imageIdentity']['ociRuntimeManifestDigest'] == self.image,
                          'verified-runtime-image-disagrees-with-plan')
        elif step in ('candidate', 'production'):
            reports = self._browser(step)
            result = {'passed': True, 'sourceCommit': self.source, 'phase': step,
                      'baseViewsPassed': reports[0]['actualCaseCount'],
                      'interactionTasksPassed': reports[1]['actualTaskCount'] if len(reports) > 1 else 0}
        elif step.startswith(('capture-', 'focused-')):
            phase = step.rsplit('-', 1)[1]
            role = 'candidateIdentity' if phase == 'candidate' else 'productionIdentity'
            identity = self.read(role)
            if phase == 'production':
                contract.need(contract.moment(identity['checkedAtUtc']) >= self.applied_at(),
                              'capture-identity-predates-this-apply')
            if step.startswith('focused-'):
                import run_browser_checks
                config = {**self.read('releaseConfig'), '_capturePhase': phase}
                result = run_browser_checks.run(self.root, config, identity, self.read('plan'), attempt,
                          contract.fresh_context_budget(**self.config.get('captureBudget', {})))
            else:
                method = Path(__file__).with_name('capture-supplemental.cjs')
                method_sha = guard.digest(method)
                copy = self.root/'browser'/'capture-supplemental.cjs'
                copy.parent.mkdir(mode=0o700, exist_ok=True)
                contract.need(not any(p.is_symlink() for p in (copy, *copy.parents)), 'unsafe-collector-copy')
                if copy.exists():
                    contract.need(guard.digest(copy) == method_sha, 'different-collector-already-present')
                else:
                    with copy.open('xb') as stream: stream.write(guard.read(method))
                args = ['node', str(method), '--root='+str(self.root), '--phase='+phase,
                        '--plan-sha256='+self.descriptor('plan')['sha256'],
                        '--identity-before='+str(self.path(role)),
                        '--identity-sha256='+self.descriptor(role)['sha256'], '--method-sha256='+method_sha,
                        '--release-config-sha256='+self.descriptor('releaseConfig')['sha256'],
                        '--attempt='+str(len(phase_runtime.status(self.stage_directory(step))['attempts']))]
                with (attempt/'stdout.log').open('xb') as stdout, (attempt/'stderr.log').open('xb') as stderr:
                    q = subprocess.run(args, stdout=stdout, stderr=stderr, timeout=3600)
                contract.need(q.returncode == 0 and guard.digest(method) == method_sha and
                              guard.digest(copy) == method_sha, 'supplemental-browser-checks-failed')
                result = {'passed': True, 'collectorSha256': method_sha, 'browserAcceptanceComplete': False,
                          'actualCapturesRoot': str(self.root/'browser'/phase)}
        elif step in ('preflight', 'apply'):
            import frontend_release
            # Revalidate the bound candidate captures immediately before native operation.
            self._browser('candidate')
            contract.need(guard.digest(self.path('archive')) == self.descriptor('archive')['sha256'],
                          'archive-changed-before-native-operation')
            arguments = ['--manifest', str(self.path('manifest')), '--preparation-baseline',
                         str(self.path('preparationBaseline')), '--phase-directory', str(self.state/'native')]
            for key, flag in (('live', '--live'), ('auditRoot', '--audit-root')):
                if key in self.config:
                    arguments.extend((flag, str(directory(self.config[key]))))
            if step == 'apply': arguments.append('--apply')
            elif phase_runtime.status(self.state/'native')['attempts']:
                arguments.append('--resume')
            if self.config.get('failureWebhookFile'):
                arguments.extend(('--failure-webhook-file', str(guard.regular(self.config['failureWebhookFile']))))
            output, errors, code = io.StringIO(), io.StringIO(), None
            try:
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(errors):
                    code = frontend_release.main(arguments)
            finally:
                release_candidate.create(attempt/'native-output.json',
                    {'stdout': output.getvalue(), 'stderr': errors.getvalue(), 'exitCode': code})
            contract.need(code in (0, None), 'native-operation-failed')
            native = json.loads(output.getvalue())
            contract.normalize_step_result('verification', native)
            contract.need(native.get('applied') is (step == 'apply'), 'native-apply-result-mismatch')
            result = {'passed': True, 'nativeGateUsed': True, 'applied': step == 'apply'}
        elif step == 'recovery-input':
            result = {'passed': True, **contract.check_recovery_input(self.read('recoveryInput'), self.source)}
        elif step == 'recovery':
            observed = self.read('recoveryReport')
            contract.need(contract.moment(observed['startedAtUtc']) >= self.applied_at(),
                          'recovery-observation-predates-this-apply')
            result = contract.check_recovery_report(observed, self.read('recoveryInput'),
                                                    self.descriptor('recoveryInput')['sha256'])
        else:
            # The archive retains both phases, including genuinely empty candidate
            # logs. Bind both sets; do not relax the maintained empty-file guard.
            reports = self._browser('candidate') + self._browser('production')
            result = release_browser.pack(self.root, reports, attempt/'browser-evidence.tar.gz')
        self.checked(step)
        result.update(step=step, sourceCommit=self.source, releaseAccepted=False,
                      productionChanged=step == 'apply', notificationsSent=False)
        release_candidate.create(attempt/'result.json', result)
        contract.need(guard.digest(self.config_path) == self.config_sha, 'config-changed-during-step')
        return result

    def run(self, step, *, resume=False, apply=False):
        self.checked(step)
        contract.need(apply == (step == 'apply'), 'apply-step-needs-explicit-apply-flag')
        contract.need(not (step == 'apply' and resume), 'apply-must-not-be-resumed')
        if step in ('preflight', 'apply') and phase_runtime.status(self.stage_directory('apply'))['applyAttempted']:
            raise phase_runtime.ResumeRefused('An apply attempt requires actual-state reconciliation, not replay')
        for prior in DEPENDENCIES.get(step, ()):
            self.prerequisite(prior)
        contract.need(not any(p.is_symlink() for p in (self.state, *self.state.parents)),
                      'symlink-state-refused')
        self.state.mkdir(mode=0o700, exist_ok=True)
        binding = self.state/'release.json'
        if binding.exists():
            contract.need(guard.load(binding) == self.identity, 'release-identity-changed-use-new-reviewed-batch')
        else:
            phase_runtime.exclusive_json(binding, self.identity)
        return phase_runtime.run_phase(self.stage_directory(step), 'apply' if step == 'apply' else 'preflight',
                    lambda attempt: self.execute(step, attempt), identity=self.stage_identity(step), resume=resume)

    def status(self):
        result = {}
        for step in STEPS:
            try:
                result[step] = phase_runtime.status(self.stage_directory(step))
            except contract.ContractError:
                result[step] = {'status': 'inputs-not-declared'}
        applied = result.get('apply', {}).get('applyAttempted', False)
        return {'sourceCommit': self.source, 'steps': result, 'applyAttempted': applied,
                'reconciliationRequired': applied and any(
                    x['status'] != 'succeeded' for x in result['apply']['attempts']),
                'releaseAccepted': False, 'recoveryVerified': False, 'productionChanged': False}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, required=True)
    parser.add_argument('--config-sha256', required=True)
    sub = parser.add_subparsers(dest='command', required=True)
    check = sub.add_parser('check'); check.add_argument('--step', choices=STEPS, required=True)
    run = sub.add_parser('run'); run.add_argument('--step', choices=STEPS, required=True)
    run.add_argument('--resume', action='store_true'); run.add_argument('--apply', action='store_true')
    sub.add_parser('status')
    args = parser.parse_args(argv)
    try:
        entry = Entry(args.config, args.config_sha256)
        if args.command == 'check': result = entry.checked(args.step)
        elif args.command == 'status': result = entry.status()
        else: result = entry.run(args.step, resume=args.resume, apply=args.apply)
        print(json.dumps(result, ensure_ascii=False)); return 0
    except Exception as error:
        print(json.dumps({'passed': False, 'failureCategory': phase_runtime.failure_category(error),
                          'reason': str(error) if isinstance(error, (contract.ContractError,
                                  phase_runtime.ResumeRefused)) else type(error).__name__,
                          'releaseAccepted': False}, ensure_ascii=False))
        return 75


if __name__ == '__main__': raise SystemExit(main())
