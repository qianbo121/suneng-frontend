"""Exact, separately approved Chinese procurement scope; no inferred publication."""
import hashlib
import json
from pathlib import Path
import re

APPROVAL_FILE = Path(__file__).with_name('approved-procurement-pages.json')
APPROVAL_SHA256 = '125f4dee788ead6de9f909fdc66346b31c1fdb9faaecd76f15a908176bd6c383'
APPROVED_PATHS = [
    '/zh/articles/special-industrial-furnace-procurement-assessment',
    '/zh/service/industrial-furnace-parts-purchasing',
]
SCOPE_FIELD = 'independentlyApprovedProcurementPages'


def approval_document():
    raw = APPROVAL_FILE.read_bytes()
    if hashlib.sha256(raw).hexdigest() != APPROVAL_SHA256:
        raise ValueError('Separate procurement approval record changed')
    value = json.loads(raw)
    if value.get('schemaVersion') != 1 or [p.get('path') for p in value['pages']] != APPROVED_PATHS:
        raise ValueError('Invalid separate procurement approval record')
    return value


def normalize_procurement(value, approval_sha=None, *, require_approval=False):
    if (not isinstance(value, list) or any(not isinstance(p, str) or p not in APPROVED_PATHS for p in value)
            or len(value) != len(set(value))):
        raise ValueError('Only the exact separately approved Chinese procurement paths may be released')
    if approval_sha is not None and approval_sha != APPROVAL_SHA256:
        raise ValueError('Separate procurement approval provenance does not match')
    if value and require_approval and approval_sha != APPROVAL_SHA256:
        raise ValueError('A procurement candidate requires its exact approval record hash')
    approval_document()
    return sorted(value)


def procurement_candidate_fields(project_root):
    """Prepare scope only after checking source parity; actual candidate GETs remain mandatory."""
    root = Path(project_root)
    source = (root / 'frontend/src/lib/approved-procurement-pages.ts').read_text()
    pages = json.loads(source.split('export const approvedProcurementPages = ', 1)[1].split(' as const;', 1)[0])
    publication = (root / 'frontend/src/lib/publication-scope.ts').read_text()
    block = re.search(r'APPROVED_PROCUREMENT_PATHS[^=]*= new Set\(\[([\s\S]*?)\]\)', publication)
    if not block or sorted(re.findall(r"'([^']+)'", block[1])) != sorted(APPROVED_PATHS):
        raise ValueError('Source procurement publication paths differ from separate approval')
    if len(pages) != 2:
        raise ValueError('Unexpected procurement source page count')
    for expected, actual in zip(approval_document()['pages'], pages.values()):
        if (actual['path'] != expected['path'] or actual['heading'] != expected['h1']
                or actual['parentPath'] != expected['entryPath']
                or actual['sha256'] != expected['approvedBodySha256']
                or hashlib.sha256(actual['html'].encode()).hexdigest() != expected['approvedBodySha256']
                or re.findall(r'<section id="([^"]+)"', actual['html']) != expected['anchors']):
            raise ValueError('Procurement source body or anchor differs from owner approval')
        route = root / 'frontend/src/app/[locale]' / actual['path'].split('/zh/', 1)[1] / 'page.tsx'
        if not route.is_file() or 'isPublishedProcurementPage' not in route.read_text():
            raise ValueError('Source lacks the approved locale-gated procurement leaf route')
    return {SCOPE_FIELD: list(APPROVED_PATHS), 'procurementApprovalSha256': APPROVAL_SHA256}
