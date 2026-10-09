"""Append-only local phase receipts; never repeat an attempted production switch."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
import uuid


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def exclusive_json(path, value):
    """Create evidence once. Existing evidence, including frozen baselines, is immutable."""
    path = Path(path)
    with path.open('x') as stream:
        os.chmod(path, 0o600)
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write('\n')
        stream.flush()
        os.fsync(stream.fileno())


def failure_category(error):
    # Command errors may contain credentials or data; never persist their message.
    if isinstance(error, (TimeoutError, subprocess.TimeoutExpired)):
        return 'timeout'
    if isinstance(error, (KeyboardInterrupt, SystemExit)):
        return 'interrupted'
    category = getattr(error, 'failure_category', None)
    if category in {'protection-change', 'invalid-baseline', 'resume-refused'}:
        return category
    if isinstance(error, (ValueError, KeyError, TypeError)):
        return 'invalid-input'
    if isinstance(error, OSError):
        return 'io-failure'
    return 'check-failed'


class ResumeRefused(RuntimeError):
    failure_category = 'resume-refused'


def status(directory):
    """Read only. A started phase with no ending receipt is interrupted, not successful."""
    directory = Path(directory)
    records = []
    for attempt in sorted(directory.glob('attempt-*')):
        start_path, end_path = attempt / 'started.json', attempt / 'finished.json'
        if not start_path.is_file():
            continue
        start = json.loads(start_path.read_text())
        ending = json.loads(end_path.read_text()) if end_path.is_file() else {}
        records.append({'attempt': attempt.name, 'phase': start['phase'],
                        'startedAt': start['startedAt'], 'status': ending.get('status', 'interrupted'),
                        'endedAt': ending.get('endedAt'), 'elapsedSeconds': ending.get('elapsedSeconds'),
                        'failureCategory': ending.get('failureCategory')})
    return {'schemaVersion': 1, 'attempts': records,
            'applyAttempted': any(item['phase'] == 'apply' for item in records)}


def run_phase(directory, phase, action, *, identity, resume=False):
    """Caller holds the deployment lock. Resume revalidates preflight from scratch."""
    if phase not in {'preflight', 'apply'}:
        raise ValueError('Unknown release phase')
    directory = Path(directory)
    previous = status(directory)
    if previous['applyAttempted']:
        raise ResumeRefused('An apply attempt requires reconciliation in a new reviewed batch')
    phase_attempts = [item for item in previous['attempts'] if item['phase'] == phase]
    if resume and phase != 'preflight':
        raise ResumeRefused('Only preflight may be explicitly resumed')
    if phase_attempts and not resume:
        raise ResumeRefused('Use explicit resume to revalidate preflight')
    if resume and not phase_attempts:
        raise ResumeRefused('No preflight attempt exists to resume')
    directory.mkdir(parents=True, exist_ok=True)
    binding_path = directory / 'operation.json'
    binding = {'schemaVersion': 1, 'identitySha256': digest(identity)}
    if binding_path.exists():
        if json.loads(binding_path.read_text()) != binding:
            raise ResumeRefused('Phase receipts belong to a different release identity')
    else:
        exclusive_json(binding_path, binding)
    attempt = directory / ('attempt-' + datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%f-') + uuid.uuid4().hex[:8])
    attempt.mkdir(mode=0o700)
    started_at, monotonic_start = now(), time.monotonic()
    exclusive_json(attempt / 'started.json', {'schemaVersion': 1, 'phase': phase,
                   'startedAt': started_at, 'status': 'running', 'identitySha256': binding['identitySha256']})
    try:
        result = action(attempt)
    except BaseException as error:
        exclusive_json(attempt / 'finished.json', {'schemaVersion': 1, 'phase': phase,
                       'startedAt': started_at, 'endedAt': now(),
                       'elapsedSeconds': max(0, time.monotonic() - monotonic_start),
                       'status': 'interrupted' if isinstance(error, (KeyboardInterrupt, SystemExit)) else 'failed',
                       'failureCategory': failure_category(error)})
        raise
    exclusive_json(attempt / 'finished.json', {'schemaVersion': 1, 'phase': phase,
                   'startedAt': started_at, 'endedAt': now(),
                   'elapsedSeconds': max(0, time.monotonic() - monotonic_start), 'status': 'succeeded'})
    return result
