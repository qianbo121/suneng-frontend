"""Sanitize before any persistence; no original notification URL is returned."""
import json, re
from urllib.parse import parse_qs, urlencode, urlsplit
from pathlib import Path
_COMPONENT = Path('/Users/qianbo/.codex/worktrees/toutiao-auto-submit-20261010/独立站/frontend/src/components/seo/ToutiaoAutoSubmit.tsx')
_TOKEN = ''
if _COMPONENT.is_file():
    match = re.search(r'\bTOUTIAO_SITE_TOKEN\s*=\s*[\'\"]([^\'\"]+)', _COMPONENT.read_text())
    if match: _TOKEN = match.group(1)

def redact_text(value):
    value = str(value)
    value = re.sub(r'https://zhanzhang\.toutiao\.com/s\.gif\?[^\s\"\'<>]+', 'https://zhanzhang.toutiao.com/s.gif [notification query redacted]', value, flags=re.I)
    if _TOKEN:
        value = value.replace(_TOKEN, '[REDACTED]')
        encoded = ''.join('%%%02X' % ord(char) for char in _TOKEN)
        value = re.sub(re.escape(encoded), '[REDACTED]', value, flags=re.I)
        from urllib.parse import quote
        value = value.replace(quote(_TOKEN, safe=''), '[REDACTED]')
    value = re.sub(r'(?i)((?:[?&]|%3f|%26)token(?:=|%3d))[^&\s\"\'<>]+', r'\1[REDACTED]', value)
    value = re.sub(r'(?i)((?:TOUTIAO_SITE_TOKEN|siteToken|token)\s*[=:]\s*[\'\"]?)[A-Za-z0-9_%.-]{8,}', r'\1[REDACTED]', value)
    # Exact production site identifier has 128 hex chars. Do not redact evidence SHA256.
    return re.sub(r'(?<![0-9a-fA-F])[0-9a-fA-F]{128,}(?![0-9a-fA-F])', '[REDACTED]', value)

def sanitize(value):
    if isinstance(value, dict):
        return {key: ('[REDACTED]' if str(key).lower() in ('token','sitetoken','toutiao_site_token') else sanitize(item)) for key,item in value.items()}
    if isinstance(value, list): return [sanitize(item) for item in value]
    return redact_text(value) if isinstance(value,str) else value

def safe_output(stdout, stderr=''):
    try: result = sanitize(json.loads(stdout))
    except (ValueError, TypeError): return redact_text(stdout + stderr)
    result_text = json.dumps(result, ensure_ascii=False, indent=2)
    return result_text + ('\n' + redact_text(stderr) if stderr else '') + '\n'

def assert_sanitized(raw):
    from urllib.parse import unquote
    decoded = unquote(unquote(raw))
    assert not (_TOKEN and (_TOKEN in raw or _TOKEN in decoded)), 'site identifier must never persist'
    assert not re.search(r'(?i)(?:[?&]|%3f|%26)token(?:=|%3d)(?!\[REDACTED\])[^&\s\"\'<>]+', raw), 'notification token must be redacted'
    return True
