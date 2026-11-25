#!/usr/bin/env python3
"""Keep exact frontend packages as a candidate receipt plus shared, verified segments."""
import argparse
from contextlib import ExitStack
from storage_reservations import staging_reservation
import fcntl
import hashlib
import json
import os
from pathlib import Path
import tempfile
import zipfile

from archive_identity import verify_archive
from archive_transfer import safe_path, validate_index, read_exact, sha256, DIGEST


def candidate_identity(data, expected):
    if not DIGEST.fullmatch(expected) or hashlib.sha256(data).hexdigest() != expected:
        raise ValueError('Candidate receipt digest differs from its trusted binding')
    candidate = json.loads(data)
    if candidate.get('component', 'frontend') != 'frontend':
        raise ValueError('Expected an official frontend candidate')
    parts = validate_index(candidate.get('archiveSegments'), candidate['archiveBytes'])
    return candidate, parts


def sync_directory(directory):
    fd = os.open(directory, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def publish(directory, name, data):
    path = safe_path(directory / name, exists=False)
    if path.exists():
        if path.read_bytes() != data:
            raise ValueError('Existing immutable history differs from the verified input')
        return False
    with tempfile.NamedTemporaryFile(dir=directory) as temporary:
        temporary.write(data)
        temporary.flush()
        os.fsync(temporary.fileno())
        os.link(temporary.name, path)
    return True


def keep(store, candidate_path, archive, expected):
    store = safe_path(store)
    candidate_path = safe_path(candidate_path)
    archive = safe_path(archive)
    data = candidate_path.read_bytes()
    candidate, parts = candidate_identity(data, expected)
    verify_archive(data, archive, candidate_sha256=expected)
    new_bytes = 0
    with staging_reservation(store, candidate['archiveBytes']), (store / '.history.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        objects, receipts = store / 'segments', store / 'releases'
        for directory in [objects, receipts]:
            safe_path(directory, exists=False).mkdir(mode=0o700, exist_ok=True)
        with archive.open('rb') as source:
            full = hashlib.sha256()
            for part in parts:
                raw = read_exact(source, part['bytes'])
                if hashlib.sha256(raw).hexdigest() != part['sha256']:
                    raise ValueError('Archive segment differs from the signed-off candidate')
                full.update(raw)
                if publish(objects, part['sha256'], raw):
                    new_bytes += len(raw)
            if source.read(1) or full.hexdigest() != candidate['archiveSha256']:
                raise ValueError('Source changed during retention')
        sync_directory(objects)
        publish(receipts, expected + '.json', data)
        sync_directory(receipts)
        sync_directory(store)
    return {'candidateSha256': expected, 'archiveBytes': candidate['archiveBytes'],
            'newSegmentBytes': new_bytes, 'reusedBytes': candidate['archiveBytes'] - new_bytes}


def read_history(store, expected, output=None):
    if not DIGEST.fullmatch(expected):
        raise ValueError('Invalid candidate receipt digest')
    store = safe_path(store)
    data = safe_path(store / 'releases' / (expected + '.json')).read_bytes()
    candidate, parts = candidate_identity(data, expected)
    whole = hashlib.sha256()
    for part in parts:
        path = safe_path(store / 'segments' / part['sha256'])
        if path.stat().st_size != part['bytes']:
            raise ValueError('Retained segment size differs')
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != part['sha256']:
            raise ValueError('Retained segment differs')
        if output is not None:
            output.write(raw)
        whole.update(raw)
    if whole.hexdigest() != candidate['archiveSha256']:
        raise ValueError('Reconstructed archive differs')
    return candidate


def restore(store, expected, destination):
    destination = safe_path(destination, exists=False)
    with tempfile.NamedTemporaryFile(dir=destination.parent) as temporary:
        candidate = read_history(store, expected, temporary)
        temporary.flush()
        os.fsync(temporary.fileno())
        os.link(temporary.name, destination)
        sync_directory(destination.parent)
    return {'archiveSha256': candidate['archiveSha256'], 'archiveBytes': candidate['archiveBytes']}


def make_delta(store, expected, basis, destination):
    """Write the receiver only those compressed segments absent from its named baseline."""
    store = safe_path(store)
    destination = safe_path(destination, exists=False)
    for digest in (expected, basis):
        if not DIGEST.fullmatch(digest):
            raise ValueError('Invalid archive binding')
    baseline = safe_path(store / 'releases' / (basis + '.json')).read_bytes()
    _, previous = candidate_identity(baseline, basis)
    data = safe_path(store / 'releases' / (expected + '.json')).read_bytes()
    candidate, parts = candidate_identity(data, expected)
    covered = {part['sha256'] for part in previous}
    with tempfile.NamedTemporaryFile(dir=destination.parent) as temp:
        with zipfile.ZipFile(temp, 'w', compression=zipfile.ZIP_STORED) as bundle:
            bundle.writestr('candidate.json', data)
            for part in parts:
                digest = part['sha256']
                if digest in covered:
                    continue
                source = safe_path(store / 'segments' / digest)
                if source.stat().st_size != part['bytes']:
                    raise ValueError('Shared segment size differs')
                raw = source.read_bytes()
                if hashlib.sha256(raw).hexdigest() != digest:
                    raise ValueError('Shared segment has changed')
                bundle.writestr('segments/' + digest, raw)
                covered.add(digest)
        temp.flush()
        os.fsync(temp.fileno())
        os.link(temp.name, destination)
        sync_directory(destination.parent)
    return {'archiveBytes': candidate['archiveBytes'], 'transferBytes': destination.stat().st_size}


def accept_delta(store, expected, bundle_path, destination):
    """Validate the reconstructed candidate and keep its new segments for future releases."""
    store = safe_path(store)
    destination = safe_path(destination, exists=False)
    with zipfile.ZipFile(safe_path(bundle_path)) as bundle, ExitStack() as resources:
        members = bundle.infolist()
        entries = {item.filename: item for item in members}
        if (not DIGEST.fullmatch(expected) or len(entries) != len(members)
                or 'candidate.json' not in entries or entries['candidate.json'].file_size > 2 * 1024 * 1024):
            raise ValueError('Invalid delta manifest')
        data = bundle.read('candidate.json')
        candidate, parts = candidate_identity(data, expected)
        allowed = {'candidate.json'} | {'segments/' + part['sha256'] for part in parts}
        if not set(entries).issubset(allowed):
            raise ValueError('Unexpected delta member')
        resources.enter_context(staging_reservation(destination.parent, candidate['archiveBytes']))
        temporary = Path(resources.enter_context(tempfile.TemporaryDirectory(dir=destination.parent)))
        archive = temporary / 'frontend.tar.gz'
        manifest = temporary / 'candidate.json'
        manifest.write_bytes(data)
        with archive.open('xb') as out:
            for part in parts:
                digest = part['sha256']
                name = 'segments/' + digest
                if name in entries:
                    entry = entries[name]
                    if entry.compress_type != zipfile.ZIP_STORED or entry.file_size != part['bytes']:
                        raise ValueError('Unexpected delta member format or size')
                    raw = bundle.read(name)
                else:
                    source = safe_path(store / 'segments' / digest)
                    if source.stat().st_size != part['bytes']:
                        raise ValueError('Required shared segment differs')
                    raw = source.read_bytes()
                if hashlib.sha256(raw).hexdigest() != digest:
                    raise ValueError('Received release segment differs')
                out.write(raw)
            out.flush()
            os.fsync(out.fileno())
        keep(store, manifest, archive, expected)
        try:
            os.link(archive, destination)
        except FileExistsError:
            existing = safe_path(destination)
            if not existing.is_file() or sha256(existing) != candidate['archiveSha256']:
                raise
        sync_directory(destination.parent)
    return {'archiveSha256': candidate['archiveSha256'], 'verified': True}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    for command in ('keep', 'restore', 'bundle', 'receive'):
        p = sub.add_parser(command)
        p.add_argument('--store', type=Path, required=True)
        p.add_argument('--candidate-sha256', required=True)
        if command == 'keep':
            p.add_argument('--candidate', type=Path, required=True)
            p.add_argument('--archive', type=Path, required=True)
        else:
            p.add_argument('--output', type=Path, required=True)
        if command == 'bundle':
            p.add_argument('--basis-sha256', required=True)
        if command == 'receive':
            p.add_argument('--bundle', type=Path, required=True)
    args = parser.parse_args()
    if args.command == 'keep':
        result = keep(args.store, args.candidate, args.archive, args.candidate_sha256)
    elif args.command == 'restore':
        result = restore(args.store, args.candidate_sha256, args.output)
    elif args.command == 'bundle':
        result = make_delta(args.store, args.candidate_sha256, args.basis_sha256, args.output)
    else:
        result = accept_delta(args.store, args.candidate_sha256, args.bundle, args.output)
    print(json.dumps(result))
