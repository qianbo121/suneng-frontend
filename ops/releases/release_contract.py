"""Fail-fast handoff checks. Complete inputs and healthy previews are not acceptance."""
import datetime
import json
from pathlib import PurePosixPath

import browser_capture_guard as guard


class ContractError(ValueError):
    failure_category = 'input-contract'


def need(condition, reason):
    if not condition:
        raise ContractError(reason)


def required(value, names):
    need(isinstance(value, dict), 'object-required')
    missing = sorted(set(names) - set(value))
    need(not missing, 'missing-inputs: ' + ', '.join(missing))


def _unique(pairs):
    result = {}
    for name, value in pairs:
        need(name not in result, 'duplicate-input-key: ' + name)
        result[name] = value
    return result


def read_bound(path, expected):
    need(isinstance(expected, str) and guard.SHA.fullmatch(expected), 'input-digest-required')
    raw = guard.read(path)
    need(guard.sha(raw) == expected, 'input-digest-mismatch')
    value = json.loads(raw, object_pairs_hook=_unique)
    need(isinstance(value, dict), 'object-required')
    return value


def normalize_step_result(stage, record):
    """Normalize only an operation result; never promote health to browser acceptance."""
    need(stage in ('preview', 'verification'), 'unknown-result-stage')
    need(isinstance(record, dict), 'result-object-required')
    field = 'healthy' if stage == 'preview' else 'passed'
    required(record, (field,))
    need(type(record[field]) is bool, 'boolean-result-required')
    need(record[field], stage + '-failed')
    if stage == 'preview' and 'passed' in record:
        need(record['passed'] is True, 'contradictory-preview-result')
    return {'stage': stage, 'succeeded': True, 'recordOnly': True,
            'releaseAccepted': False, 'browserAccepted': False}


RECOVERY_INPUTS = frozenset({
    'schemaVersion', 'kind', 'actualPostApplyOriginals', 'referenceSha256',
    'sourceCommit', 'maintainedToolsSha256', 'localFormalReportSha256',
    'futureServerPassed', 'futureReleaseAccepted', 'toolsPins', 'baseline',
    'formalRecords', 'expectedCurrentImages', 'sixNativeProtectedImages',
    'protectedConfigurationFiles', 'frontendVersions', 'historicalFourImagesExpected',
})


def pins(value):
    need(isinstance(value, dict) and bool(value), 'nonempty-tool-pins-required')
    for name, digest in value.items():
        need(isinstance(name, str) and bool(name) and '\\' not in name and
             not PurePosixPath(name).is_absolute() and '..' not in PurePosixPath(name).parts and
             PurePosixPath(name).as_posix() == name, 'relative-tool-name-required')
        need(isinstance(digest, str) and guard.SHA.fullmatch(digest), 'tool-digest-required')


def check_recovery_input(value, source):
    required(value, RECOVERY_INPUTS)
    need(type(value['schemaVersion']) is int and value['schemaVersion'] == 1 and
         value['kind'] == 'actual-post-apply-recovery-check-input', 'recovery-input-version-required')
    need(isinstance(source, str) and guard.SOURCE.fullmatch(source) and
         value['sourceCommit'] == source, 'recovery-source-mismatch')
    need(value['actualPostApplyOriginals'] is True and
         value['futureServerPassed'] is False and value['futureReleaseAccepted'] is False,
         'actual-input-without-future-success-required')
    for name in ('referenceSha256', 'localFormalReportSha256'):
        need(isinstance(value[name], str) and guard.SHA.fullmatch(value[name]), 'recovery-digest-required')
    pins(value['toolsPins']); pins(value['maintainedToolsSha256'])
    required(value['baseline'], ('snapshot', 'allContainerIdentities'))
    need(isinstance(value['baseline']['snapshot'], dict) and bool(value['baseline']['snapshot']) and
         isinstance(value['baseline']['allContainerIdentities'], (dict, list)) and
         bool(value['baseline']['allContainerIdentities']), 'actual-baseline-required')
    need(isinstance(value['formalRecords'], dict) and
         set(value['formalRecords']) == {'current', 'previous', 'operation', 'retentionPlan'},
         'four-recovery-records-required')
    for record in value['formalRecords'].values():
        required(record, ('path', 'sha256'))
        need(isinstance(record['path'], str) and bool(record['path']) and
             isinstance(record['sha256'], str) and guard.SHA.fullmatch(record['sha256']),
             'bound-recovery-record-required')
    for name in ('expectedCurrentImages', 'historicalFourImagesExpected'):
        need(isinstance(value[name], dict) and bool(value[name]), 'recovery-version-map-required')
    for name in ('sixNativeProtectedImages', 'protectedConfigurationFiles', 'frontendVersions'):
        need(isinstance(value[name], list) and bool(value[name]), 'recovery-list-required')
    need(len(value['frontendVersions']) == 2 and
         {v.get('role') for v in value['frontendVersions']} == {'current', 'previous'},
         'exact-current-previous-version-set-required')
    for version in value['frontendVersions']:
        required(version, ('role', 'sourceCommit', 'runtimeImage', 'archiveSha256', 'archiveBytes'))
        need(isinstance(version['sourceCommit'], str) and guard.SOURCE.fullmatch(version['sourceCommit']) and
             isinstance(version['runtimeImage'], str) and guard.IMAGE.fullmatch(version['runtimeImage']) and
             isinstance(version['archiveSha256'], str) and guard.SHA.fullmatch(version['archiveSha256']) and
             type(version['archiveBytes']) is int and version['archiveBytes'] > 0,
             'bound-frontend-version-required')
        if version['role'] == 'current':
            need(version['sourceCommit'] == source and
                 value['expectedCurrentImages'].get('frontend') == version['runtimeImage'],
                 'current-recovery-image-source-mismatch')
    return {'inputComplete': True, 'sourceCommit': source, 'recoveryVerified': False,
            'releaseAccepted': False, 'productionChanged': False}


def fresh_context_budget(contexts=3, navigation_ms=45000, action_ms=45000):
    need(type(contexts) is int and 1 <= contexts <= 24, 'bounded-context-count-required')
    need(type(navigation_ms) is int and 1000 <= navigation_ms <= 90000,
         'bounded-navigation-budget-required')
    need(type(action_ms) is int and 1000 <= action_ms <= 180000,
         'bounded-action-budget-required')
    total = contexts * navigation_ms + action_ms
    need(total <= 600000, 'total-capture-budget-too-large')
    return total


def moment(value):
    need(isinstance(value, str), 'timestamp-required')
    result = datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
    need(result.tzinfo is not None, 'timezone-required')
    return result


def check_recovery_report(report, value, input_digest):
    """Check the bound observer's existing report; do not claim a new server observation."""
    check_recovery_input(value, value['sourceCommit'])
    required(report, ('kind', 'passed', 'readOnly', 'inputRead', 'archiveChecks', 'toolPins',
                     'productionReceiptSha256', 'previousReceiptSha256', 'operationReceiptSha256',
                     'retentionPlanSha256', 'localFormalReportSha256', 'startedAtUtc', 'finishedAtUtc',
                     'restorePerformed', 'cleanupPerformed', 'releaseAccepted', 'productionBrowserAccepted',
                     'containerCount', 'allSixteenServicesAndConfigurationsUnchanged',
                     'containerMetadataUnchangedDuringCheck', 'originalThirtyToolPinsUnchanged'))
    need(report['kind'] == 'fresh-read-only-server-recovery-material-observation' and
         report['passed'] is True and report['readOnly'] is True, 'actual-recovery-observation-required')
    need(all(report[k] is False for k in ('restorePerformed', 'cleanupPerformed', 'releaseAccepted',
                                        'productionBrowserAccepted')), 'recovery-observation-must-not-apply')
    required(report['inputRead'], ('sha256', 'fullReadMatched', 'regularSingleLink',
                                   'stableDescriptorAndPathDuringRead'))
    need(report['inputRead']['sha256'] == input_digest and all(report['inputRead'][k] is True for k in
         ('fullReadMatched', 'regularSingleLink', 'stableDescriptorAndPathDuringRead')),
         'actual-recovery-input-read-required')
    for role, field in (('current', 'productionReceiptSha256'), ('previous', 'previousReceiptSha256'),
                        ('operation', 'operationReceiptSha256'), ('retentionPlan', 'retentionPlanSha256')):
        need(report[field] == value['formalRecords'][role]['sha256'], 'recovery-record-mismatch')
    need(report['localFormalReportSha256'] == value['localFormalReportSha256'], 'local-recovery-report-mismatch')
    pins(report['toolPins'])
    need(all(value['maintainedToolsSha256'].get(n) == h for n, h in report['toolPins'].items()),
         'observed-recovery-tool-mismatch')
    need(type(report['containerCount']) is int and report['containerCount'] ==
         len(value['baseline']['allContainerIdentities']) and all(report[k] is True for k in
         ('allSixteenServicesAndConfigurationsUnchanged', 'containerMetadataUnchangedDuringCheck',
          'originalThirtyToolPinsUnchanged')), 'recovery-protected-state-required')
    need(set(report['archiveChecks']) == {'current', 'previous'}, 'two-recovery-archives-required')
    versions = {row['role']: row for row in value['frontendVersions']}
    need(set(versions) == {'current', 'previous'}, 'two-frontend-versions-required')
    for role, row in report['archiveChecks'].items():
        expected = versions[role]
        need(row.get('passed') is True and row.get('sha256') == expected['archiveSha256'] and
             row.get('sourceCommit') == expected['sourceCommit'] and row.get('bytes') == expected['archiveBytes'],
             'recovery-archive-mismatch')
    need(moment(report['finishedAtUtc']) >= moment(report['startedAtUtc']), 'recovery-observation-time-order')
    return {'passed': True, 'recoveryReportValidated': True, 'newServerObservation': False,
            'releaseAccepted': False, 'productionChanged': False}
