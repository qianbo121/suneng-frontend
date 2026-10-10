#!/usr/bin/env python3
"""One preparation entry for immutable candidates and real acceptance. Never deploys or deletes."""
import argparse
import copy
import datetime
import json
import os
from pathlib import Path

import archive_identity
import browser_capture_guard as guard
import release_browser
import storage_policy


def create(path, value):
    path = Path(path).absolute()
    guard.require('..' not in path.parts and path.parent.is_dir() and not path.exists() and
                  not any(p.is_symlink() for p in (path, *path.parents)), 'new-private-output-required')
    raw = (json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode()
    with path.open('xb') as stream:
        os.fchmod(stream.fileno(), 0o600);stream.write(raw);stream.flush();os.fsync(stream.fileno())
    return guard.sha(raw)


def browser_args(parser):
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--plan-sha256', required=True)
    parser.add_argument('--report', required=True)
    parser.add_argument('--report-sha256', required=True)
    parser.add_argument('--phase', choices=['candidate', 'production'], required=True)
    parser.add_argument('--preview-sha256')
    parser.add_argument('--interaction-report')
    parser.add_argument('--interaction-sha256')


def browser_checks(args):
    report = release_browser.validate(args.root, args.report, args.phase,
                                     plan_sha256=args.plan_sha256, report_sha256=args.report_sha256,
                                     preview_sha256=args.preview_sha256)
    if args.phase == 'production':
        guard.require(args.interaction_report and args.interaction_sha256, 'production-interaction-report-required')
    else:
        guard.require(not args.interaction_report and not args.interaction_sha256,
                      'candidate-command-validates-base-contract-only')
    reports = [report]
    if args.interaction_report:
        reports.append(release_browser.validate_interactions(args.root, args.interaction_report,
                           plan_sha256=args.plan_sha256, report_sha256=args.interaction_sha256))
    return reports


def accepted_routing_proposal(args):
    """Prepare a narrow receipt proposal after validated captures; never install it live."""
    guard.require(args.phase == 'production', 'routing-closeout-needs-production-acceptance')
    guard.require(all(isinstance(value, str) and guard.SHA.fullmatch(value)
                      for value in (args.template_sha256, args.active_sha256)), 'reviewed-config-digests-required')
    reports = browser_checks(args)
    root, plan = release_browser.load_plan(args.root, args.plan_sha256)
    initial = release_browser.checked(args.current_receipt, args.current_receipt_sha256)
    final = release_browser.checked(args.final_state, args.final_state_sha256)
    baseline = release_browser.checked(root/'baseline.json', plan['baselineSha256'])
    summary = release_browser.checked(args.summary, args.summary_sha256)
    adjacent = release_browser.checked(args.adjacent, args.adjacent_sha256)
    for count in (args.mapping_count, args.target_count, args.resource_count, args.adjacent_count):
        guard.require(type(count) is int and count > 0, 'positive-reviewed-acceptance-counts-required')
    guard.require(summary.get('reviewedCommit') == plan['sourceCommit'] and summary.get('passed') is True and
                  all(type(summary.get(k)) is int and summary[k] == args.mapping_count
                      for k in ('mappingCount', 'passedMappings', 'raw301', 'final200')) and
                  summary.get('passedTargetPages') == args.target_count and
                  summary.get('resourcesChecked') == summary.get('resources200') == args.resource_count,
                  'passed-full-legacy-and-resource-checks-required')
    targets = summary.get('targets')
    guard.require(isinstance(targets, list) and len(targets) == args.target_count and
                  len({v.get('path') for v in targets}) == args.target_count and
                  all(v.get('status') == 200 and v.get('missingAnchors') == [] for v in targets),
                  'passed-unique-targets-with-anchors-required')
    guard.require(adjacent.get('sourceCommit') == plan['sourceCommit'] and
                  adjacent.get('checkCount') == adjacent.get('passed') == args.adjacent_count and
                  adjacent.get('failed') == [], 'passed-adjacent-checks-required')
    guard.require(final.get('passed') is True and final.get('sourceCommit') == plan['sourceCommit'] and
                  final.get('frontendImage') == plan['runtimeImage'] and final.get('protectedElevenUnchanged') is True and
                  final.get('templateSha256') == args.template_sha256 and
                  final.get('activeConfigSha256') == args.active_sha256 and
                  final['protectedFilesSha256']['RELEASE_ARTIFACTS.json'] == args.current_receipt_sha256,
                  'actual-final-source-runtime-config-receipt-required')
    containers = final.get('containers', {})
    guard.require(set(containers) == set(baseline['containers']) and len(containers) == final.get('serviceCount') and
                  all(v.get('running') is True and v.get('health') in (None, 'healthy') for v in containers.values()) and
                  all(containers[n] == v for n, v in baseline['containers'].items() if n != '/corp-site-frontend'),
                  'actual-protected-service-identities-required')
    frontend = containers['/corp-site-frontend']
    guard.require(frontend.get('source') == plan['sourceCommit'] and frontend.get('image') == plan['runtimeImage'] and
                  frontend.get('health') == 'healthy' and initial.get('images', {}).get('frontend') == plan['runtimeImage'],
                  'matching-actual-frontend-receipt-required')
    for report in reports:
        for key in ('identityBefore', 'identityAfter'):
            observed = guard.load(root/guard.relative(report[key]))['container']
            guard.require(all(observed.get(k) == frontend.get(k) for k in ('id', 'source', 'image', 'running', 'health')),
                          'captures-must-match-final-running-frontend')
    proposal = copy.deepcopy(initial)
    guard.require(isinstance(proposal.get('edgeLegacyProductRouting'), dict), 'existing-edge-object-required')
    proposal['edgeLegacyProductRouting'] = {
        'sourceCommit': plan['sourceCommit'], 'runtimeImage': plan['runtimeImage'],
        'previousReceiptSha256': args.current_receipt_sha256,
        'accepted': True, 'addedMappings': args.mapping_count, 'targetPagesPassed': args.target_count,
        'staticResourcesPassed': args.resource_count, 'adjacentChecksPassed': args.adjacent_count,
        'productionBaseViewsPassed': reports[0]['actualCaseCount'],
        'productionInteractionTasksPassed': reports[1]['actualTaskCount'],
        'templateSha256': args.template_sha256, 'activeConfigSha256': args.active_sha256,
        'planSha256': args.plan_sha256, 'productionReportSha256': args.report_sha256,
        'interactionReportSha256': args.interaction_sha256,
        'summarySha256': args.summary_sha256, 'adjacentSummarySha256': args.adjacent_sha256,
        'finalStateSha256': args.final_state_sha256,
    }
    unchanged = lambda value: {k: v for k, v in value.items() if k != 'edgeLegacyProductRouting'}
    guard.require(unchanged(initial) == unchanged(proposal), 'only-accepted-edge-object-may-change')
    guard.require(guard.digest(args.current_receipt) == args.current_receipt_sha256 and
                  guard.digest(args.final_state) == args.final_state_sha256, 'receipt-inputs-changed')
    return {'passed': True, 'proposalOnly': True, 'productionChanged': False,
            'currentReceiptSha256': args.current_receipt_sha256,
            'changedObject': 'edgeLegacyProductRouting', 'otherObjectsEqual': True,
            'receiptProposal': proposal,
            'limitations': ['Not installed in production; applying a receipt needs the deployment lock and a fresh live-state guard.',
                            'Retained browser and final-state capture timestamps describe their original observation windows.']}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    archive = sub.add_parser('verify-archive')
    archive.add_argument('--candidate', type=Path, required=True)
    archive.add_argument('--candidate-sha256', required=True)
    archive.add_argument('--archive', type=Path, required=True)
    archive.add_argument('--source-commit')
    space = sub.add_parser('check-import-after-transfer')
    space.add_argument('--candidate', type=Path, action='append', required=True)
    for name in ('archive', 'image-store', 'staging'):
        space.add_argument('--'+name, type=Path, required=True)
    space.add_argument('--candidate-sha256', required=True)
    browser = sub.add_parser('verify-browser');browser_args(browser)
    pack = sub.add_parser('pack-browser');browser_args(pack)
    pack.add_argument('--bundle', type=Path, required=True)
    pack.add_argument('--retained-report', action='append', nargs=2, default=[],
                      metavar=('RELATIVE_REPORT', 'EXTERNAL_SHA256'),
                      help='Bind retained capture files without treating this report as acceptance')
    proposal = sub.add_parser('prepare-routing-receipt');browser_args(proposal)
    for name in ('current-receipt', 'final-state', 'summary', 'adjacent'):
        proposal.add_argument('--'+name, type=Path, required=True)
        proposal.add_argument('--'+name+'-sha256', required=True)
    for name in ('mapping', 'target', 'resource', 'adjacent'):
        proposal.add_argument('--'+name+'-count', type=int, required=True)
    proposal.add_argument('--template-sha256', required=True)
    proposal.add_argument('--active-sha256', required=True)
    for command in (archive, space, browser, pack, proposal):command.add_argument('--receipt', type=Path, required=True)
    args = parser.parse_args(argv)
    # All operations are read-only except this new private receipt and optional evidence bundle.
    guard.require(not args.receipt.exists() and args.receipt.parent.is_dir(), 'fresh-command-receipt-required')
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        if args.command == 'verify-archive':
            result = archive_identity.verify_archive(args.candidate, args.archive,
                     candidate_sha256=args.candidate_sha256, expected_source_commit=args.source_commit)
        elif args.command == 'check-import-after-transfer':
            guard.require(len(args.candidate) == 1, 'one-staged-candidate-required')
            result = storage_policy.staged_import_space(args.candidate[0], args.candidate_sha256,
                                                        args.archive, args.image_store, args.staging)
        elif args.command == 'prepare-routing-receipt':result = accepted_routing_proposal(args)
        else:
            reports = browser_checks(args)
            if args.command == 'pack-browser':
                root, plan = release_browser.load_plan(args.root, args.plan_sha256)
                retained = {}
                for name, digest in args.retained_report:
                    guard.require(name not in retained, 'duplicate-retained-report')
                    value = release_browser.checked(root/guard.relative(name), digest)
                    guard.require(value.get('sourceCommit') == plan['sourceCommit'] and
                                  value.get('planSha256') == args.plan_sha256,
                                  'same-batch-retained-report-required')
                    guard.check_bound_files(root, value.get('boundFilesSha256'))
                    reports.append(value);retained[name] = digest
                result = release_browser.pack(root, reports, args.bundle)
                guard.require(all(guard.digest(root/guard.relative(name)) == digest
                                  for name, digest in retained.items()), 'retained-report-changed-during-pack')
                result.update(retainedReportDigests=retained, retainedReportsUsedForAcceptance=False)
            else:result = {'passed': True, 'sourceCommit': reports[0]['sourceCommit'], 'phase': args.phase,
                          'baseViewsPassed': reports[0]['actualCaseCount'],
                          'interactionTasksPassed': reports[1]['actualTaskCount'] if len(reports) > 1 else 0}
        result.update(command=args.command, startedAtUtc=started, productionChanged=False, notificationsSent=False)
        create(args.receipt, result)
        print(json.dumps({'passed': result['passed'], 'command': args.command, 'receipt': str(args.receipt), 'productionChanged': False}))
        return 0 if result['passed'] else 75
    except Exception as error:
        create(args.receipt, {'passed': False, 'command': args.command, 'startedAtUtc': started,
                             'failureType': type(error).__name__, 'failedEvidencePreserved': True,
                             'productionChanged': False, 'notificationsSent': False})
        raise


if __name__ == '__main__':raise SystemExit(main())
