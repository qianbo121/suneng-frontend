#!/usr/bin/env python3
"""Optional verified archive transport; Docker import remains the existing importer's job.

Segmented gzip is opt-in because older tarfile stream readers cannot read it.
The official Actions ZIP is always authoritative. Cached segments only come from a
ZIP checked against its trusted digest and its embedded Docker image identity.
"""
import argparse
import gzip
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import struct
import sys
import tarfile
import tempfile
import zipfile

DIGEST = re.compile(r'[0-9a-f]{64}')
COMMIT = re.compile(r'[0-9a-f]{40}')
IMAGE_ID = re.compile(r'sha256:[0-9a-f]{64}')
CHUNK = 8 * 1024 * 1024
INDEX_VERSION = 1


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(CHUNK), b''):
            digest.update(block)
    return digest.hexdigest()


def safe_path(path, *, exists=True):
    path = Path(path).absolute()
    if '..' in path.parts:
        raise ValueError('Path traversal is not allowed')
    for item in (path, *path.parents):
        if item.is_symlink():
            raise ValueError('Symlink paths are not allowed')
    if exists and not path.exists():
        raise ValueError('Required path does not exist')
    return path


def safe_name(value):
    if not isinstance(value, str) or not value or '\\' in value:
        raise ValueError('Unsafe archive member path')
    name = PurePosixPath(value)
    if name.is_absolute() or any(part in ('..', '.') for part in value.split('/')):
        raise ValueError('Unsafe archive member path')
    return value


def positive(value):
    return type(value) is int and value > 0


def validate_index(index, archive_bytes):
    if not isinstance(index, dict) or index.get('schemaVersion') != INDEX_VERSION:
        raise ValueError('Unsupported segment index')
    segments = index.get('segments')
    if not isinstance(segments, list) or not segments:
        raise ValueError('Missing segments')
    offset = 0
    for segment in segments:
        if (not isinstance(segment, dict) or segment.get('offset') != offset
                or not positive(segment.get('bytes')) or segment['bytes'] > CHUNK + 65536
                or not isinstance(segment.get('sha256'), str)
                or not DIGEST.fullmatch(segment['sha256'])):
            raise ValueError('Invalid segment identity or order')
        offset += segment['bytes']
    if offset != archive_bytes:
        raise ValueError('Segment size differs from complete archive')
    return segments


def read_exact(stream, size):
    result = bytearray()
    while len(result) < size:
        block = stream.read(size - len(result))
        if not block:
            raise ValueError('Truncated Docker tar stream')
        result.extend(block)
    return bytes(result)


def pack_stream(stream, output, chunk_bytes=CHUNK):
    """Keep every input tar byte; only gzip member boundaries change."""
    output = safe_path(output, exists=False)
    if not positive(chunk_bytes) or not 512 <= chunk_bytes <= CHUNK:
        raise ValueError('Invalid chunk size')
    segments = []
    with output.open('xb') as target:
        def write_segment(raw):
            start = target.tell()
            with gzip.GzipFile(fileobj=target, mode='wb', filename='', mtime=0, compresslevel=6) as zipped:
                zipped.write(raw)
            end = target.tell()
            segments.append({'offset': start, 'bytes': end - start})

        while True:
            header = stream.read(512)
            if not header:
                break
            if len(header) != 512:
                raise ValueError('Truncated Docker tar header')
            if header == b'\0' * 512:
                # Preserve tar footer and padding exactly, including concatenated input.
                raw = header + stream.read(chunk_bytes - 512)
                write_segment(raw)
                for block in iter(lambda: stream.read(chunk_bytes), b''):
                    write_segment(block)
                break
            member = tarfile.TarInfo.frombuf(header, 'utf-8', 'surrogateescape')
            safe_name(member.name.rstrip('/'))
            size = ((member.size + 511) // 512) * 512
            # Member payload boundaries stay stable when an earlier member changes.
            write_segment(header)
            while size:
                amount = min(size, chunk_bytes)
                write_segment(read_exact(stream, amount))
                size -= amount
    if not segments:
        raise ValueError('Empty Docker tar stream')
    with output.open('rb') as stream:
        for segment in segments:
            stream.seek(segment['offset'])
            segment['sha256'] = hashlib.sha256(read_exact(stream, segment['bytes'])).hexdigest()
    return {'schemaVersion': INDEX_VERSION, 'segments': segments}


def validate_candidate(candidate, archive):
    component = candidate.get('component', 'frontend')
    if component not in ('frontend', 'backend', 'admin'):
        raise ValueError('Unsupported candidate component')
    source = candidate.get('sourceCommit')
    image_id = candidate.get('buildImageId')
    layers = candidate.get('rootFsDiffIds')
    if (candidate.get('schemaVersion') != 1 or candidate.get('status') != 'candidate-not-deployed'
            or candidate.get('sourceIdentity') != 'git-commit'
            or not isinstance(source, str) or not COMMIT.fullmatch(source)
            or candidate.get('imageTag') != f'suneng-verified-{component}:{source}'
            or not isinstance(image_id, str) or not IMAGE_ID.fullmatch(image_id)
            or not isinstance(layers, list) or not layers
            or any(not isinstance(item, str) or not IMAGE_ID.fullmatch(item) for item in layers)
            or not positive(candidate.get('archiveBytes')) or not positive(candidate.get('imageBytes'))
            or not isinstance(candidate.get('archiveSha256'), str)
            or not DIGEST.fullmatch(candidate['archiveSha256'])):
        raise ValueError('Invalid candidate source/image contract')
    if archive.stat().st_size != candidate['archiveBytes'] or sha256(archive) != candidate['archiveSha256']:
        raise ValueError('Complete Docker archive identity mismatch')
    if 'archiveSegments' in candidate:
        if candidate.get('archiveFormat') != 'gzip-segments-v1':
            raise ValueError('Unmarked segmented archive format')
        segments = validate_index(candidate['archiveSegments'], candidate['archiveBytes'])
        with archive.open('rb') as stream:
            for segment in segments:
                if hashlib.sha256(read_exact(stream, segment['bytes'])).hexdigest() != segment['sha256']:
                    raise ValueError('Archive segment digest mismatch')
    config_name = image_id.removeprefix('sha256:')
    files, manifest, configs, seen = {}, None, {}, set()
    with gzip.open(archive, 'rb') as uncompressed, tarfile.open(fileobj=uncompressed, mode='r|') as saved:
        for member in saved:
            name = safe_name(member.name.rstrip('/'))
            if member.issym() or member.islnk() or not (member.isfile() or member.isdir()):
                raise ValueError('Unsafe Docker archive member')
            if name in seen:
                raise ValueError('Duplicate Docker archive member')
            seen.add(name)
            if not member.isfile():
                continue
            stream = saved.extractfile(member)
            digest = hashlib.sha256()
            capture = name == 'manifest.json' or name in (config_name + '.json', 'blobs/sha256/' + config_name)
            if capture and member.size > 2 * 1024 * 1024:
                raise ValueError('Oversized image metadata')
            data = bytearray()
            for block in iter(lambda: stream.read(CHUNK), b''):
                digest.update(block)
                if capture:
                    data.extend(block)
            files[name] = 'sha256:' + digest.hexdigest()
            if name == 'manifest.json':
                manifest = json.loads(data)
            elif capture:
                configs[name] = json.loads(data)
    if not isinstance(manifest, list):
        raise ValueError('Missing Docker save manifest')
    matches = [item for item in manifest if isinstance(item, dict) and candidate['imageTag'] in (item.get('RepoTags') or [])]
    if len(matches) != 1:
        raise ValueError('Docker manifest does not identify the candidate image')
    image = matches[0]
    config_path = safe_name(image.get('Config'))
    config = configs.get(config_path)
    if files.get(config_path) != image_id or not isinstance(config, dict):
        raise ValueError('Docker config differs from candidate build image')
    if config.get('rootfs', {}).get('diff_ids') != layers:
        raise ValueError('Docker root filesystem differs from candidate')
    if config.get('config', {}).get('Labels', {}).get('org.opencontainers.image.revision') != source:
        raise ValueError('Docker image source revision differs from candidate')
    saved_layers = image.get('Layers')
    if (not isinstance(saved_layers, list) or len(saved_layers) != len(layers)
            or [files.get(safe_name(name)) for name in saved_layers] != layers):
        raise ValueError('Docker layer contents differ from candidate')
    return component


def validate_official_zip(official, expected_digest, destination):
    official = safe_path(official)
    if not isinstance(expected_digest, str) or not DIGEST.fullmatch(expected_digest) or sha256(official) != expected_digest:
        raise ValueError('Official ZIP digest mismatch')
    with zipfile.ZipFile(official) as zipped:
        members = zipped.infolist()
        if len(members) != 2 or len({item.filename for item in members}) != 2:
            raise ValueError('Official ZIP must have exactly two members')
        for item in members:
            safe_name(item.filename)
            mode = item.external_attr >> 16
            if stat.S_ISLNK(mode) or item.is_dir() or item.flag_bits & 1:
                raise ValueError('Unsafe official ZIP member')
        if 'candidate.json' not in zipped.namelist():
            raise ValueError('Missing candidate receipt')
        if zipped.getinfo('candidate.json').file_size > 2 * 1024 * 1024:
            raise ValueError('Oversized candidate receipt')
        candidate = json.loads(zipped.read('candidate.json'))
        if not isinstance(candidate, dict):
            raise ValueError('Invalid candidate receipt')
        component = candidate.get('component', 'frontend')
        name = component + '.tar.gz' if isinstance(component, str) else ''
        if set(zipped.namelist()) != {'candidate.json', name}:
            raise ValueError('Unexpected official ZIP members')
        archive = destination / name
        with zipped.open(name) as source, archive.open('xb') as target:
            shutil.copyfileobj(source, target, CHUNK)
        validate_candidate(candidate, archive)
        info = zipped.getinfo(name)
        offset = None
        if info.compress_type == zipfile.ZIP_STORED:
            with official.open('rb') as stream:
                stream.seek(info.header_offset)
                header = read_exact(stream, 30)
                if header[:4] != b'PK\x03\x04':
                    raise ValueError('Invalid official ZIP local header')
                filename_bytes, extra_bytes = struct.unpack('<HH', header[26:30])
                offset = info.header_offset + 30 + filename_bytes + extra_bytes
                stream.seek(offset)
                digest = hashlib.sha256()
                remaining = info.file_size
                while remaining:
                    block = read_exact(stream, min(CHUNK, remaining)); digest.update(block); remaining -= len(block)
                if digest.hexdigest() != candidate['archiveSha256']:
                    raise ValueError('ZIP stored-member identity mismatch')
    return candidate, archive, offset


def cache_segment(cache, digest):
    if not DIGEST.fullmatch(digest):
        raise ValueError('Invalid cache digest')
    return safe_path(cache / (digest + '.gz'), exists=False)


def verified_cache(cache):
    cache = safe_path(cache)
    registry = safe_path(cache / 'verified.json')
    try:
        value = json.loads(registry.read_text())
    except (OSError, ValueError) as error:
        raise ValueError('Cache has no verified provenance') from error
    if not isinstance(value, dict) or value.get('schemaVersion') != 1 or not isinstance(value.get('archives'), dict):
        raise ValueError('Invalid cache provenance')
    allowed = set()
    for official_digest, digests in value['archives'].items():
        if not DIGEST.fullmatch(official_digest) or not isinstance(digests, list):
            raise ValueError('Invalid cache provenance')
        for digest in digests:
            if not isinstance(digest, str) or not DIGEST.fullmatch(digest):
                raise ValueError('Invalid cache provenance')
            allowed.add(digest)
    return cache, value, allowed


def seed_cache(official, expected_digest, cache):
    cache = safe_path(cache, exists=False)
    with tempfile.TemporaryDirectory() as folder:
        candidate, archive, _ = validate_official_zip(official, expected_digest, Path(folder).resolve())
        if 'archiveSegments' not in candidate:
            return {'mode': 'full', 'cachedSegments': 0}
        segments = validate_index(candidate['archiveSegments'], candidate['archiveBytes'])
        cache.mkdir(parents=True, exist_ok=True)
        if (cache / 'verified.json').exists():
            _, registry, _ = verified_cache(cache)
        else:
            registry = {'schemaVersion': 1, 'archives': {}}
        with archive.open('rb') as stream:
            for segment in segments:
                path = cache_segment(cache, segment['sha256'])
                raw = read_exact(stream, segment['bytes'])
                with path.open('wb') as target:
                    target.write(raw)
        registry['archives'][expected_digest] = [item['sha256'] for item in segments]
        registry_path = safe_path(cache / 'verified.json', exists=False)
        registry_path.write_text(json.dumps(registry, sort_keys=True) + '\n')
    return {'mode': 'segments', 'cachedSegments': len(segments)}


def optional_cache(cache):
    if cache is None:
        return None, set()
    path = safe_path(cache, exists=False)
    if not path.exists() or not (path / 'verified.json').exists():
        return None, set()
    path, _, allowed = verified_cache(path)
    return path, allowed


def cached_segment(cache, allowed, segment):
    if cache is None or segment['sha256'] not in allowed:
        return None
    path = cache_segment(cache, segment['sha256'])
    if not path.is_file() or path.stat().st_size != segment['bytes'] or sha256(path) != segment['sha256']:
        return None
    return path


def create_bundle(official, expected_digest, output, cache=None):
    output = safe_path(output, exists=False)
    official = safe_path(official)
    cache, allowed = optional_cache(cache)
    with tempfile.TemporaryDirectory() as folder:
        candidate, archive, offset = validate_official_zip(official, expected_digest, Path(folder).resolve())
        segments = candidate.get('archiveSegments')
        reusable = [] if segments is None else [cached_segment(cache, allowed, item) for item in segments['segments']]
        use_segments = offset is not None and any(reusable)
        receipt = {'schemaVersion': 1, 'officialSha256': expected_digest, 'officialBytes': official.stat().st_size,
                   'mode': 'segments' if use_segments else 'full'}
        with zipfile.ZipFile(output, 'x', compression=zipfile.ZIP_STORED) as bundle:
            if use_segments:
                receipt['archiveOffset'] = offset
                receipt['archiveBytes'] = candidate['archiveBytes']
                receipt['archiveSegments'] = segments
                with official.open('rb') as stream:
                    with bundle.open('prefix', 'w', force_zip64=True) as target:
                        shutil.copyfileobj(io.BytesIO(read_exact(stream, offset)), target)
                    stream.seek(offset + candidate['archiveBytes'])
                    with bundle.open('suffix', 'w', force_zip64=True) as target:
                        shutil.copyfileobj(stream, target, CHUNK)
                with archive.open('rb') as stream:
                    written = set()
                    for item, reusable_path in zip(segments['segments'], reusable):
                        stream.seek(item['offset'])
                        if reusable_path is None and item['sha256'] not in written:
                            bundle.writestr('segments/' + item['sha256'] + '.gz', read_exact(stream, item['bytes']))
                            written.add(item['sha256'])
            else:
                bundle.write(official, 'official.zip')
            bundle.writestr('transfer.json', json.dumps(receipt, sort_keys=True) + '\n')
    return {'mode': receipt['mode'], 'bundleBytes': output.stat().st_size,
            'reusedSegments': sum(item is not None for item in reusable) if use_segments else 0}


def receive_bundle(bundle_path, expected_digest, output, cache=None):
    bundle_path = safe_path(bundle_path)
    output = safe_path(output, exists=False)
    cache, allowed = optional_cache(cache)
    if output.exists():
        raise ValueError('Output already exists')
    temporary = None
    try:
        with zipfile.ZipFile(bundle_path) as bundle:
            names = bundle.namelist()
            if len(names) != len(set(names)):
                raise ValueError('Duplicate transfer member')
            for member in bundle.infolist():
                safe_name(member.filename)
                if member.is_dir() or stat.S_ISLNK(member.external_attr >> 16) or member.flag_bits & 1:
                    raise ValueError('Unsafe transfer member')
            if 'transfer.json' not in names or bundle.getinfo('transfer.json').file_size > 2 * 1024 * 1024:
                raise ValueError('Missing or oversized transfer receipt')
            receipt = json.loads(bundle.read('transfer.json'))
            if (receipt.get('schemaVersion') != 1 or receipt.get('officialSha256') != expected_digest
                    or not isinstance(expected_digest, str) or not DIGEST.fullmatch(expected_digest)
                    or not positive(receipt.get('officialBytes'))):
                raise ValueError('Official ZIP transfer identity mismatch')
            with tempfile.NamedTemporaryFile(dir=output.parent, prefix=output.name + '.', suffix='.partial', delete=False) as target:
                temporary = Path(target.name)
                if receipt.get('mode') == 'full':
                    if set(names) != {'transfer.json', 'official.zip'}:
                        raise ValueError('Unexpected full-transfer member')
                    with bundle.open('official.zip') as source:
                        shutil.copyfileobj(source, target, CHUNK)
                elif receipt.get('mode') == 'segments':
                    segments = validate_index(receipt.get('archiveSegments'), receipt.get('archiveBytes'))
                    permitted = {'transfer.json', 'prefix', 'suffix'} | {'segments/' + item['sha256'] + '.gz' for item in segments}
                    if not set(names).issubset(permitted) or not {'prefix', 'suffix'}.issubset(names):
                        raise ValueError('Unexpected segmented-transfer member')
                    if bundle.getinfo('prefix').file_size != receipt.get('archiveOffset'):
                        raise ValueError('Incorrect ZIP archive offset')
                    with bundle.open('prefix') as source:
                        shutil.copyfileobj(source, target, CHUNK)
                    for item in segments:
                        name = 'segments/' + item['sha256'] + '.gz'
                        if name in names:
                            if bundle.getinfo(name).file_size != item['bytes']:
                                raise ValueError('Transferred segment size mismatch')
                            raw = bundle.read(name)
                            if hashlib.sha256(raw).hexdigest() != item['sha256']:
                                raise ValueError('Transferred segment digest mismatch')
                            target.write(raw)
                        else:
                            path = cached_segment(cache, allowed, item)
                            if path is None:
                                raise ValueError('Required verified cache segment is missing or corrupt; resend it')
                            with path.open('rb') as source:
                                shutil.copyfileobj(source, target, CHUNK)
                    with bundle.open('suffix') as source:
                        shutil.copyfileobj(source, target, CHUNK)
                else:
                    raise ValueError('Unsupported transfer mode')
            if temporary.stat().st_size != receipt['officialBytes']:
                raise ValueError('Reconstructed official ZIP size mismatch')
            with tempfile.TemporaryDirectory() as folder:
                validate_official_zip(temporary, expected_digest, Path(folder).resolve())
            # Only a validated complete official ZIP is handed back to the importer.
            # The temporary file is on the destination filesystem. link is an
            # atomic no-replace operation; exists()+rename could overwrite a
            # file another task creates after the check.
            os.link(temporary, output, follow_symlinks=False)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()
    return {'mode': receipt['mode'], 'officialSha256': expected_digest, 'verified': True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    pack = commands.add_parser('pack')
    pack.add_argument('--output', type=Path, required=True)
    pack.add_argument('--index', type=Path, required=True)
    for name in ('seed', 'bundle', 'receive'):
        command = commands.add_parser(name)
        command.add_argument('--official-sha256', required=True, help='Trusted Actions artifact digest')
        command.add_argument('--cache', type=Path, required=name == 'seed')
        if name == 'seed':
            command.add_argument('--official', type=Path, required=True)
        elif name == 'bundle':
            command.add_argument('--official', type=Path, required=True)
            command.add_argument('--output', type=Path, required=True)
        else:
            command.add_argument('--bundle', type=Path, required=True)
            command.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if args.command == 'pack':
        index_path = safe_path(args.index, exists=False)
        if index_path.exists():
            raise ValueError('Index output already exists')
        result = pack_stream(sys.stdin.buffer, args.output)
        index_path.write_text(json.dumps(result, sort_keys=True) + '\n')
    elif args.command == 'seed':
        result = seed_cache(args.official, args.official_sha256, args.cache)
    elif args.command == 'bundle':
        result = create_bundle(args.official, args.official_sha256, args.output, args.cache)
    else:
        result = receive_bundle(args.bundle, args.official_sha256, args.output, args.cache)
    print(json.dumps(result, sort_keys=True))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, tarfile.TarError, zipfile.BadZipFile) as error:
        sys.exit(str(error))
