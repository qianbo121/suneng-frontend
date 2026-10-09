"""Read-only complete-body check for the separate procurement pages, outside the 11-guide denominator."""
import json
from pathlib import Path
import subprocess
from procurement_approval import approval_document, normalize_procurement, resolve_approval_sha

PUBLIC_ORIGIN = 'https://www.jssngyl.cn'
CANDIDATE_ORIGIN = 'http://127.0.0.1:3000'
REQUIRED = {'http', 'indexable', 'canonical', 'h1', 'body', 'anchors', 'contactToolbar', 'sitemap', 'entry'}


def approved_procurement_probe(container, paths, *, public=False, approval_sha=None):
    selected = resolve_approval_sha(approval_sha)
    paths = normalize_procurement(paths, selected)
    base = PUBLIC_ORIGIN if public else CANDIDATE_ORIGIN
    pages = [p for p in approval_document(selected)['pages'] if p['path'] in paths]
    source = Path(__file__).with_name('approved-procurement-continuity.cjs').read_text()
    source += '\ncheckApprovedProcurement(' + json.dumps({'baseUrl': base, 'pages': pages}) + ').then(r => console.log(JSON.stringify(r))).catch(() => { console.error("Approved procurement check failed; no private output logged"); process.exitCode = 1; });\n'
    try:
        result = subprocess.run(['docker', 'exec', '-i', container, 'node', '-'],
                                input=source, text=True, capture_output=True, timeout=180)
    except subprocess.TimeoutExpired as error:
        raise RuntimeError('Approved procurement check exceeded its bounded timeout') from error
    if result.returncode:
        raise RuntimeError('Approved procurement checker failed to run')
    try:
        report = json.loads(result.stdout)
    except (ValueError, TypeError) as error:
        raise RuntimeError('Approved procurement checker returned invalid JSON') from error
    rows = report.get('pages', [])
    if (report.get('baseUrl') != base or report.get('canonicalOrigin') != PUBLIC_ORIGIN
            or report.get('pagesChecked') != len(paths) or len(rows) != len(paths)
            or sorted(p.get('path', '') for p in rows) != paths or not isinstance(report.get('passed'), bool)):
        raise RuntimeError('Approved procurement checker omitted or changed its approved scope')
    expected = {p['path']: p for p in pages}
    if report['passed'] and any(p.get('passed') is not True or p.get('status') != 200
            or p.get('contentStreamSha256') != expected[p['path']]['contentStreamSha256']
            or not REQUIRED <= set(p.get('checks', {}))
            or any(p['checks'][k].get('passed') is not True for k in REQUIRED) for p in rows):
        raise RuntimeError('Approved procurement success lacks actual body/contact/anchor evidence')
    report['releasePhase'] = 'public' if public else 'candidate'
    report['procurementApprovalSha256'] = selected
    return report
