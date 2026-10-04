"""Run the approved procurement checker using Node already in the fixed frontend image.

The checked module is streamed over stdin, so a standalone candidate need not
contain frontend source scripts. No image build, install, form or contact action.
"""
import json
from pathlib import Path
import subprocess

PUBLIC_ORIGIN = 'https://www.jssngyl.cn'
CANDIDATE_ORIGIN = 'http://127.0.0.1:3000'
APPROVED_PATHS = json.loads(Path(__file__).with_name('approved-guides.json').read_text())


def acquisition_continuity_probe(container, *, public=False):
    source = Path(__file__).with_name('acquisition-continuity.mjs').read_text()
    base = PUBLIC_ORIGIN if public else CANDIDATE_ORIGIN
    # The copy is kept byte-for-byte equal to the standalone frontend checker by
    # a source parity test. Its ordinary CLI does not run for stdin module input.
    source += '\nconst releaseReport = await checkAcquisitionContinuity(' + json.dumps({'baseUrl': base, 'timeoutMs': 20000}) + ');\n'
    source += "releaseReport.limitations = releaseReport.limitations.filter(item => !item.includes('尚未接入部署流水线'));\n"
    source += "releaseReport.limitations.push('本报告用于前台发布门槛；不证明真实联系接收或排名恢复。');\n"
    source += 'releaseReport.releasePhase = ' + json.dumps('public' if public else 'candidate') + ';\nconsole.log(JSON.stringify(releaseReport));\n'
    try:
        result = subprocess.run(['docker', 'exec', '-i', container, 'node', '--input-type=module', '-'],
                                input=source, text=True, capture_output=True, timeout=360)
    except subprocess.TimeoutExpired as error:
        raise RuntimeError('Procurement continuity check exceeded its bounded timeout') from error
    if result.returncode:
        # Never print Docker output, an environment value or a response body.
        raise RuntimeError('Procurement continuity checker failed to run')
    try:
        report = json.loads(result.stdout)
    except (ValueError, TypeError) as error:
        raise RuntimeError('Procurement continuity checker returned invalid JSON') from error
    pages = report.get('pages', [])
    if (report.get('baseUrl') != base or report.get('canonicalOrigin') != PUBLIC_ORIGIN
            or report.get('pagesChecked') != len(APPROVED_PATHS)
            or len(pages) != len(APPROVED_PATHS)
            or sorted(page.get('path', '') for page in pages) != sorted(APPROVED_PATHS)
            or not isinstance(report.get('passed'), bool)):
        raise RuntimeError('Procurement continuity checker did not inspect every approved path')
    # A declared success must include every actual required check, not just HTTP.
    required = {'http', 'indexable', 'canonical', 'content', 'contactToolbar', 'sitemap'}
    if report['passed'] and (not report.get('sitemap', {}).get('passed') or report.get('failedPages') != 0
            or any(page.get('passed') is not True or page.get('status') != 200
                   or not required <= set(page.get('checks', {}))
                   or any(page['checks'][name].get('passed') is not True for name in required)
                   for page in pages)):
        raise RuntimeError('Procurement continuity success report is incomplete')
    return report
