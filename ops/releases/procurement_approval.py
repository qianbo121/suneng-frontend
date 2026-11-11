"""Exact, separately approved Chinese procurement scope; no inferred publication."""
import hashlib
import json
from pathlib import Path
import re

APPROVAL_FILE = Path(__file__).with_name('approved-procurement-pages.json')
APPROVAL_SHA256 = '125f4dee788ead6de9f909fdc66346b31c1fdb9faaecd76f15a908176bd6c383'
CURRENT_APPROVAL_FILE = Path(__file__).with_name('approved-procurement-pages-20261009.json')
CURRENT_APPROVAL_SHA256 = 'c13cd276d54fbf4a42ae17f03d9d46f78dedf114e49d04aeb04b8e767a9d1934'
AUTHORIZATION_FILE = Path(__file__).with_name('procurement-content-authorization-20261009.json')
AUTHORIZATION_SHA256 = '111b4418c854ba6e0d2920c3519897473a9a6d92d62ec61bac2dce5401c72f66'
APPROVED_PATHS = [
    '/zh/articles/special-industrial-furnace-procurement-assessment',
    '/zh/service/industrial-furnace-parts-purchasing',
]
ENGLISH_EQUIPMENT_PATH = '/en/articles/special-industrial-furnace-procurement-assessment'
BILINGUAL_SCOPE_FILE = Path(__file__).with_name('procurement-bilingual-scope-20261111.json')
BILINGUAL_SCOPE_SHA256 = '30e5467979d38d062dca2582d4c5e7f675705cef91e1f2f2aff4c4d707a4fbc1'
SCOPE_FIELD = 'independentlyApprovedProcurementPages'


def resolve_approval_sha(approval_sha=None):
    # Historical receipts before the hash field described the original bodies.
    if approval_sha is None:
        return APPROVAL_SHA256
    if not isinstance(approval_sha, str) or approval_sha not in (APPROVAL_SHA256, CURRENT_APPROVAL_SHA256, BILINGUAL_SCOPE_SHA256):
        raise ValueError('Separate procurement approval provenance does not match')
    return approval_sha


def approval_document(approval_sha=APPROVAL_SHA256):
    selected = resolve_approval_sha(approval_sha)
    if selected == BILINGUAL_SCOPE_SHA256:
        raw = BILINGUAL_SCOPE_FILE.read_bytes()
        if hashlib.sha256(raw).hexdigest() != selected:
            raise ValueError('Bilingual procurement scope changed')
        addition = json.loads(raw)
        if (addition['previousApprovalSha256'] != CURRENT_APPROVAL_SHA256
                or addition['page']['path'] != ENGLISH_EQUIPMENT_PATH):
            raise ValueError('Unexpected English procurement scope')
        document = approval_document(CURRENT_APPROVAL_SHA256)
        document['pages'].append(addition['page'])
        return document
    raw = (APPROVAL_FILE if selected == APPROVAL_SHA256 else CURRENT_APPROVAL_FILE).read_bytes()
    if hashlib.sha256(raw).hexdigest() != selected:
        raise ValueError('Separate procurement approval record changed')
    value = json.loads(raw)
    if value.get('schemaVersion') != 1 or [p.get('path') for p in value['pages']] != APPROVED_PATHS:
        raise ValueError('Invalid separate procurement approval record')
    if selected == CURRENT_APPROVAL_SHA256:
        authorization = AUTHORIZATION_FILE.read_bytes()
        if (hashlib.sha256(authorization).hexdigest() != AUTHORIZATION_SHA256
                or value['approvalSource'].get('humanApprovalSha256') != AUTHORIZATION_SHA256
                or value.get('previousApprovalSha256') != APPROVAL_SHA256
                or value['approvalSource'].get('deploymentAuthorized') is not False):
            raise ValueError('Procurement content authorization evidence changed')
    return value


def normalize_procurement(value, approval_sha=None, *, require_approval=False):
    selected = resolve_approval_sha(approval_sha)
    allowed = [page['path'] for page in approval_document(selected)['pages']]
    if (not isinstance(value, list) or any(not isinstance(p, str) or p not in allowed for p in value)
            or len(value) != len(set(value))):
        raise ValueError('Only the exact separately approved Chinese procurement paths may be released')
    if value and require_approval and approval_sha is None:
        raise ValueError('A procurement candidate requires its exact approval record hash')
    return sorted(value)


def procurement_candidate_fields(project_root, approval_sha=BILINGUAL_SCOPE_SHA256):
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
    selected = resolve_approval_sha(approval_sha)
    for expected, actual in zip(approval_document(selected)['pages'], pages.values()):
        if (actual['path'] != expected['path'] or actual['heading'] != expected['h1']
                or actual['parentPath'] != expected['entryPath']
                or actual['sha256'] != expected['approvedBodySha256']
                or hashlib.sha256(actual['html'].encode()).hexdigest() != expected['approvedBodySha256']
                or re.findall(r'<section id="([^"]+)"', actual['html']) != expected['anchors']):
            raise ValueError('Procurement source body or anchor differs from owner approval')
        route = root / 'frontend/src/app/[locale]' / actual['path'].split('/zh/', 1)[1] / 'page.tsx'
        if not route.is_file() or 'isPublishedProcurementPage' not in route.read_text():
            raise ValueError('Source lacks the approved locale-gated procurement leaf route')
    paths = list(APPROVED_PATHS)
    if selected == BILINGUAL_SCOPE_SHA256:
        english = json.loads((root / 'frontend/src/lib/equipment-procurement-en.json').read_text())
        expected = approval_document(selected)['pages'][-1]
        if (english['path'] != expected['path'] or english['heading'] != expected['h1']
                or english['parentPath'] != expected['entryPath']
                or hashlib.sha256(english['html'].encode()).hexdigest() != expected['approvedBodySha256']
                or re.findall(r'<section id="([^"]+)"', english['html']) != expected['anchors']):
            raise ValueError('English equipment procurement copy differs from the bilingual scope')
        paths.append(ENGLISH_EQUIPMENT_PATH)
    return {SCOPE_FIELD: paths, 'procurementApprovalSha256': selected}
