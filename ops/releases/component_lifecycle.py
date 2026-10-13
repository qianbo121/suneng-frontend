"""Explicit owner retirement keeps archived recovery identity, never silently skips a missing service."""
import re

IMAGE = re.compile(r'^sha256:[0-9a-f]{64}$')

def retired_admin(receipt):
    retired = receipt.get('retiredComponents', {})
    if not retired:
        return False
    if not isinstance(retired, dict) or set(retired) != {'admin'}:
        raise ValueError('Unknown component retirement')
    entry = retired['admin']
    meta = receipt.get('adminRelease', {})
    if (not isinstance(entry, dict) or entry.get('status') != 'retired'
            or not isinstance(entry.get('retiredAt'), str) or not entry['retiredAt']
            or entry.get('image') != meta.get('image')
            or not IMAGE.fullmatch(entry.get('image', ''))
            or 'admin' in receipt.get('images', {})):
        raise ValueError('Invalid explicit admin retirement receipt')
    return True

def active_components(receipt):
    return ('frontend', 'backend') if retired_admin(receipt) else ('frontend', 'backend', 'admin')

def recovery_image(receipt, component):
    if component == 'admin' and retired_admin(receipt):
        return receipt['retiredComponents']['admin']['image']
    return receipt.get('images', {}).get(component)
