#!/usr/bin/env python3
"""Offline, externally bound OCI/Docker-save proof with one sequential TAR pass.

The raw archive checksum is read once before any decompression. The same open
file is rewound once, then expanded once without extraction or backward seeking.
This proof identifies archive contents; it does not claim a server import,
browser acceptance, official artifact provenance, or deployment.
"""
import argparse
import datetime
import gzip
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import sys
import tarfile
import time
import zlib

CHUNK = 8 * 1024 * 1024
TAR_BUFFER = 64 * 1024
MAX_METADATA = 2 * 1024 * 1024
MAX_CAPTURED_METADATA = 64 * 1024 * 1024
MAX_MEMBERS = 100_000
MAX_EXTENSION_HEADERS = 128
EXTENSION_TYPES = {tarfile.XHDTYPE, tarfile.XGLTYPE, tarfile.SOLARIS_XHDTYPE,
                   tarfile.GNUTYPE_LONGNAME, tarfile.GNUTYPE_LONGLINK}
DIGEST = re.compile(r"[0-9a-f]{64}")
COMMIT = re.compile(r"[0-9a-f]{40}")
IMAGE_ID = re.compile(r"sha256:[0-9a-f]{64}")
BLOB = re.compile(r"blobs/sha256/[0-9a-f]{64}")
MANIFEST_MEDIA = {"application/vnd.oci.image.manifest.v1+json",
                  "application/vnd.docker.distribution.manifest.v2+json"}
CONFIG_MEDIA = {"application/vnd.oci.image.config.v1+json",
                "application/vnd.docker.container.image.v1+json"}
RAW_LAYER_MEDIA = {"application/vnd.oci.image.layer.v1.tar",
                   "application/vnd.docker.image.rootfs.diff.tar"}
GZIP_LAYER_MEDIA = {"application/vnd.oci.image.layer.v1.tar+gzip",
                    "application/vnd.docker.image.rootfs.diff.tar.gzip"}


def _require(condition, reason):
    if not condition:
        raise ValueError(reason)


def _sha(raw):
    return hashlib.sha256(raw).hexdigest()


def _signature(value):
    return (value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns,
            value.st_ctime_ns, value.st_nlink)


def _stamp(path):
    return _signature(path.stat())


def _regular(value):
    path = Path(value).absolute()
    _require(".." not in path.parts and not any(p.is_symlink() for p in (path, *path.parents)),
             "unsafe-input-path")
    info = path.stat()
    _require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1,
             "single-link-regular-input-required")
    return path


def _positive(value):
    return type(value) is int and value > 0


def _name(value):
    _require(isinstance(value, str) and value and "\\" not in value
             and "\x00" not in value and not PurePosixPath(value).is_absolute()
             and not any(p in ("", ".", "..") for p in value.split("/"))
             and PurePosixPath(value).as_posix() == value, "unsafe-tar-member")
    return value


def _object(pairs):
    result = {}
    for key, value in pairs:
        _require(key not in result, "duplicate-JSON-key")
        result[key] = value
    return result


def _json(raw):
    return json.loads(raw, object_pairs_hook=_object)


def _candidate(value, expected_sha, expected_source):
    _require(isinstance(expected_sha, str) and DIGEST.fullmatch(expected_sha),
             "external-candidate-sha256-required")
    path, stamp = None, None
    if isinstance(value, bytes):
        raw = value
    else:
        _require(isinstance(value, (str, os.PathLike)), "candidate-bytes-or-path-required")
        path = _regular(value)
        stamp = _stamp(path)
        _require(stamp[2] <= MAX_METADATA, "oversized-candidate-metadata")
        raw = path.read_bytes()
        _require(_stamp(path) == stamp, "candidate-changed-during-read")
    _require(len(raw) <= MAX_METADATA and _sha(raw) == expected_sha,
             "candidate-external-digest-mismatch")
    candidate = _json(raw)
    _require(isinstance(candidate, dict), "candidate-object-required")
    component = candidate.get("component", "frontend")
    source = candidate.get("sourceCommit")
    roots = candidate.get("rootFsDiffIds")
    _require(component in ("frontend", "backend", "admin")
             and type(candidate.get("schemaVersion")) is int and candidate["schemaVersion"] == 1
             and candidate.get("status") == "candidate-not-deployed"
             and candidate.get("sourceIdentity") == "git-commit"
             and isinstance(source, str) and COMMIT.fullmatch(source)
             and candidate.get("imageTag") == f"suneng-verified-{component}:{source}"
             and isinstance(candidate.get("buildImageId"), str)
             and IMAGE_ID.fullmatch(candidate["buildImageId"])
             and isinstance(roots, list) and roots
             and all(isinstance(x, str) and IMAGE_ID.fullmatch(x) for x in roots)
             and _positive(candidate.get("archiveBytes")) and _positive(candidate.get("imageBytes"))
             and isinstance(candidate.get("archiveSha256"), str)
             and DIGEST.fullmatch(candidate["archiveSha256"]), "invalid-candidate-source-image-contract")
    if expected_source is not None:
        _require(isinstance(expected_source, str) and COMMIT.fullmatch(expected_source)
                 and source == expected_source, "expected-full-source-commit-mismatch")
    return candidate, path, stamp


class _SequentialReader:
    """Measure actual expanded reads and forbid seeking the gzip/TAR input."""
    def __init__(self, stream, limit):
        self.stream, self.limit = stream, limit
        self.bytes_read, self.read_calls, self.seek_calls = 0, 0, 0

    def read(self, amount=-1):
        _require(amount >= 0, "unbounded-archive-read-rejected")
        block = self.stream.read(amount)
        self.bytes_read += len(block)
        self.read_calls += 1
        _require(self.bytes_read <= self.limit, "archive-expansion-boundary")
        return block

    def seek(self, *args):
        self.seek_calls += 1
        raise ValueError("backward-or-random-archive-read-rejected")



class _BoundedTarInfo(tarfile.TarInfo):
    """Bound hidden PAX/GNU metadata before tarfile reads or recursively parses it."""
    def _proc_member(self, archive):
        count = getattr(archive, "_identity_header_count", 0) + 1
        _require(count <= MAX_MEMBERS, "too-many-tar-members")
        archive._identity_header_count = count
        _require(self.size >= 0, "negative-tar-member-size")
        if self.type in EXTENSION_TYPES:
            _require(self.size <= MAX_METADATA, "oversized-tar-extension-metadata")
            extensions = getattr(archive, "_identity_extension_count", 0) + 1
            _require(extensions <= MAX_EXTENSION_HEADERS, "too-many-tar-extension-headers")
            size = getattr(archive, "_identity_extension_bytes", 0) + self.size
            _require(size + getattr(archive, "_identity_captured_metadata_bytes", 0)
                     <= MAX_CAPTURED_METADATA, "metadata-memory-boundary")
            archive._identity_extension_count = extensions
            archive._identity_extension_bytes = size
        else:
            _require(self.type in (tarfile.REGTYPE, tarfile.AREGTYPE, tarfile.DIRTYPE),
                     "links-and-special-members-rejected")
        return super()._proc_member(archive)

    def _reject_sparse(self, *args):
        # PAX sparse helpers can parse additional data before a member is yielded.
        raise ValueError("links-and-special-members-rejected")

    _proc_gnusparse_00 = _reject_sparse
    _proc_gnusparse_01 = _reject_sparse
    _proc_gnusparse_10 = _reject_sparse


def _scan(stream, candidate):
    files, metadata, names = {}, {}, set()
    metadata_bytes, payload_bytes, expanded_payload_bytes, last_member_end = 0, 0, 0, 0
    expanded_limit = max(candidate["imageBytes"] * 2, candidate["archiveBytes"] * 2)
    with gzip.GzipFile(fileobj=stream, mode="rb") as compressed:
        outer = _SequentialReader(compressed, expanded_limit + MAX_CAPTURED_METADATA)
        # Bound the buffer while avoiding one Python read call per 512-byte TAR block.
        with tarfile.open(fileobj=outer, mode="r|", bufsize=TAR_BUFFER, tarinfo=_BoundedTarInfo) as saved:
            for member in saved:
                name = _name(member.name.rstrip("/") if member.isdir() else member.name)
                _require(name not in names, "duplicate-tar-member")
                names.add(name)
                last_member_end = member.offset_data + ((member.size + 511) // 512) * 512
                _require(len(names) <= MAX_MEMBERS, "too-many-tar-members")
                _require(member.type in (tarfile.REGTYPE, tarfile.AREGTYPE, tarfile.DIRTYPE)
                         and member.sparse is None, "links-and-special-members-rejected")
                if member.isdir():
                    continue
                _require(member.size >= 0, "negative-tar-member-size")
                if name.startswith("blobs/sha256/"):
                    _require(BLOB.fullmatch(name), "invalid-content-addressed-blob-path")
                required_metadata = name in ("index.json", "oci-layout", "manifest.json")
                _require(not required_metadata or member.size <= MAX_METADATA, "oversized-image-metadata")
                capture = required_metadata or (BLOB.fullmatch(name) and member.size <= MAX_METADATA)
                content = bytearray()
                digest, expanded = hashlib.sha256(), hashlib.sha256()
                size, expanded_size, decoder = 0, 0, None
                with saved.extractfile(member) as payload:
                    while True:
                        block = payload.read(CHUNK)
                        if not block:
                            break
                        if size == 0 and BLOB.fullmatch(name) and block[:2] == b"\x1f\x8b":
                            decoder = zlib.decompressobj(31)
                        size += len(block)
                        digest.update(block)
                        if capture:
                            content.extend(block)
                        if decoder is None:
                            expanded.update(block)
                            expanded_size += len(block)
                        else:
                            pending = block
                            while pending:
                                output = decoder.decompress(pending, CHUNK)
                                expanded.update(output)
                                expanded_size += len(output)
                                _require(expanded_size <= expanded_limit, "layer-expansion-boundary")
                                _require(not decoder.unused_data, "trailing-or-concatenated-layer-gzip")
                                pending = decoder.unconsumed_tail
                _require(size == member.size, "short-tar-member")
                if decoder is not None:
                    _require(decoder.eof and not decoder.unused_data and not decoder.unconsumed_tail,
                             "incomplete-layer-gzip")
                record = {"sha256": "sha256:" + digest.hexdigest(), "bytes": size,
                          "rootFsDiffId": "sha256:" + expanded.hexdigest(),
                          "gzip": decoder is not None, "expandedBytes": expanded_size}
                if BLOB.fullmatch(name):
                    _require(record["sha256"][7:] == name.rsplit("/", 1)[1], "blob-filename-digest-mismatch")
                files[name] = record
                payload_bytes += size
                expanded_payload_bytes += expanded_size
                _require(expanded_payload_bytes <= expanded_limit + MAX_CAPTURED_METADATA,
                         "total-layer-expansion-boundary")
                if capture:
                    metadata_bytes += len(content)
                    _require(metadata_bytes + getattr(saved, "_identity_extension_bytes", 0)
                             <= MAX_CAPTURED_METADATA, "metadata-memory-boundary")
                    saved._identity_captured_metadata_bytes = metadata_bytes
                    metadata[name] = bytes(content)
            # Include the stream reader's unread buffer in the padding check.
            # This prevents hiding a second image/TAR after the first end marker.
            _require(not any(saved.fileobj.buf), "nonzero-data-after-tar-end")
        # TAR EOF alone does not check gzip CRC/trailers: drain through real EOF.
        while True:
            tail = outer.read(CHUNK)
            if not tail:
                break
            _require(not any(tail), "nonzero-data-after-tar-end")
        _require(outer.bytes_read - last_member_end >= 1024, "two-complete-TAR-end-blocks-required")
    return files, metadata, {"archiveChecksumPasses": 1, "sequentialTarPasses": 1,
                             "tarInputSeekCalls": outer.seek_calls, "tarReadBufferBytes": TAR_BUFFER,
                             "outerExpandedBytesRead": outer.bytes_read,
                             "outerReadCalls": outer.read_calls,
                             "memberCount": getattr(saved, "_identity_header_count", 0),
                             "visibleMemberCount": len(names),
                             "extensionHeaderCount": getattr(saved, "_identity_extension_count", 0),
                             "extensionMetadataBytes": getattr(saved, "_identity_extension_bytes", 0),
                             "filePayloadBytesHashed": payload_bytes,
                             "expandedPayloadBytesHashed": expanded_payload_bytes,
                             "capturedMetadataBytes": metadata_bytes + getattr(saved, "_identity_extension_bytes", 0),
                             "capturedImageMetadataBytes": metadata_bytes}


def _descriptor(descriptor, files, metadata=None, media=None):
    _require(isinstance(descriptor, dict) and isinstance(descriptor.get("digest"), str)
             and IMAGE_ID.fullmatch(descriptor["digest"]) and _positive(descriptor.get("size")),
             "invalid-OCI-descriptor")
    if media is not None:
        _require(descriptor.get("mediaType") in media, "unsupported-OCI-descriptor-media")
    blob = "blobs/sha256/" + descriptor["digest"][7:]
    record = files.get(blob)
    _require(record and record["sha256"] == descriptor["digest"]
             and record["bytes"] == descriptor["size"], "OCI-descriptor-content-mismatch")
    if metadata is not None:
        _require(blob in metadata, "required-OCI-metadata-missing-or-oversized")
    return blob, record


def _identity(candidate, files, metadata):
    _require(_json(metadata.get("oci-layout", b"null")) == {"imageLayoutVersion": "1.0.0"},
             "supported-OCI-layout-required")
    index_raw = metadata.get("index.json")
    _require(index_raw is not None, "OCI-index-required")
    index = _json(index_raw)
    _require(isinstance(index, dict) and index.get("schemaVersion") == 2
             and isinstance(index.get("manifests"), list) and len(index["manifests"]) == 1,
             "single-candidate-OCI-runtime-required")
    runtime = index["manifests"][0]
    manifest_path, manifest_record = _descriptor(runtime, files, metadata, MANIFEST_MEDIA)
    if "platform" in runtime:
        _require(isinstance(runtime["platform"], dict)
                 and runtime["platform"].get("os") == "linux"
                 and runtime["platform"].get("architecture") == "amd64"
                 and runtime["platform"].get("variant") in (None, ""), "OCI-platform-mismatch")
    manifest = _json(metadata[manifest_path])
    _require(isinstance(manifest, dict) and manifest.get("schemaVersion") == 2
             and manifest.get("mediaType", runtime["mediaType"]) in MANIFEST_MEDIA,
             "valid-OCI-manifest-required")
    config_path, config_record = _descriptor(manifest.get("config"), files, metadata, CONFIG_MEDIA)
    _require(config_record["sha256"] == candidate["buildImageId"], "OCI-config-candidate-mismatch")
    config = _json(metadata[config_path])
    _require(isinstance(config, dict) and config.get("os") == "linux"
             and config.get("architecture") == "amd64"
             and config.get("variant") in (None, "")
             and isinstance(config.get("rootfs"), dict) and config["rootfs"].get("type") == "layers"
             and config["rootfs"].get("diff_ids") == candidate["rootFsDiffIds"]
             and isinstance(config.get("config"), dict)
             and isinstance(config["config"].get("Labels"), dict)
             and config["config"]["Labels"].get("org.opencontainers.image.revision") == candidate["sourceCommit"],
             "OCI-platform-source-rootfs-mismatch")
    layers = manifest.get("layers")
    _require(isinstance(layers, list) and len(layers) == len(candidate["rootFsDiffIds"]),
             "OCI-layer-count-mismatch")
    checks, layer_paths = [], []
    for descriptor, diff_id in zip(layers, candidate["rootFsDiffIds"]):
        blob, record = _descriptor(descriptor, files, media=RAW_LAYER_MEDIA | GZIP_LAYER_MEDIA)
        _require(record["gzip"] == (descriptor["mediaType"] in GZIP_LAYER_MEDIA)
                 and record["rootFsDiffId"] == diff_id, "full-OCI-layer-or-expanded-rootfs-mismatch")
        layer_paths.append(blob)
        checks.append({"blob": blob, "sha256": record["sha256"], "bytes": record["bytes"],
                       "rootFsDiffId": diff_id, "expandedBytes": record["expandedBytes"],
                       "gzip": record["gzip"], "passed": True})
    docker_raw = metadata.get("manifest.json")
    _require(docker_raw is not None, "Docker-save-manifest-required")
    docker = _json(docker_raw)
    _require(isinstance(docker, list) and len(docker) == 1 and isinstance(docker[0], dict)
             and docker[0].get("RepoTags") == [candidate["imageTag"]]
             and docker[0].get("Config") == config_path and docker[0].get("Layers") == layer_paths,
             "single-Docker-image-tags-config-layers-required")
    return {"buildConfigurationId": candidate["buildImageId"],
            "ociRuntimeManifestDigest": runtime["digest"], "architecture": "amd64", "os": "linux",
            "configSource": candidate["sourceCommit"], "rootFsDiffIds": candidate["rootFsDiffIds"],
            "rootFsDiffIdsMatched": True, "indexSha256": _sha(index_raw), "indexBytes": len(index_raw),
            "manifestSha256": manifest_record["sha256"][7:], "manifestBytes": manifest_record["bytes"],
            "configBytes": config_record["bytes"], "dockerManifestSha256": _sha(docker_raw),
            "dockerRepoTags": docker[0]["RepoTags"], "layerBlobChecks": checks,
            "serverImportIdentityNotYetObserved": True}


def verify_archive(candidate, archive, *, candidate_sha256, expected_source_commit=None):
    """Return a complete offline proof, or raise ValueError/OSError on rejection.

    candidate is original JSON bytes or a regular single-link JSON file path.
    candidate_sha256 must come from an independently trusted candidate receipt;
    computing it from the input alone does not establish trust. archive must be
    a regular single-link gzip TAR. No output files or deployment actions occur.
    """
    started = time.perf_counter()
    candidate, candidate_path, candidate_stamp = _candidate(candidate, candidate_sha256, expected_source_commit)
    archive_path = _regular(archive)
    archive_stamp = _stamp(archive_path)
    _require(archive_stamp[2] == candidate["archiveBytes"], "full-archive-size-mismatch")
    with archive_path.open("rb") as stream:
        _require(_signature(os.fstat(stream.fileno())) == archive_stamp, "archive-open-identity-mismatch")
        digest, bytes_read = hashlib.sha256(), 0
        for block in iter(lambda: stream.read(CHUNK), b""):
            digest.update(block)
            bytes_read += len(block)
        _require(bytes_read == candidate["archiveBytes"] and digest.hexdigest() == candidate["archiveSha256"],
                 "full-archive-checksum-mismatch")
        _require(_signature(os.fstat(stream.fileno())) == archive_stamp and _stamp(archive_path) == archive_stamp,
                 "archive-changed-during-checksum")
        checksum_seconds = time.perf_counter() - started
        stream.seek(0)  # Exactly one rewind after the full raw checksum, before the sole TAR pass.
        files, metadata, stats = _scan(stream, candidate)
        identity = _identity(candidate, files, metadata)
        _require(_signature(os.fstat(stream.fileno())) == archive_stamp and _stamp(archive_path) == archive_stamp,
                 "archive-changed-during-verification")
    if candidate_path is not None:
        _require(_stamp(candidate_path) == candidate_stamp, "candidate-changed-during-verification")
    stats.update({"rawArchiveBytesHashed": bytes_read, "rawArchiveRewindsBeforeTar": 1,
                  "checksumSeconds": checksum_seconds,
                  "totalSeconds": time.perf_counter() - started})
    return {"schemaVersion": 1, "checkedAtUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "passed": True, "sourceCommit": candidate["sourceCommit"],
            "candidateSha256": candidate_sha256, "candidateJsonSha256": candidate_sha256,
            "archiveSha256": candidate["archiveSha256"], "archiveBytes": candidate["archiveBytes"],
            "imageIdentity": identity, "scanStats": stats,
            "completeArchiveAndAllLayerPayloadsVerified": True, "completeGzipEofVerified": True,
            "serverImported": False, "productionSwitched": False}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--candidate", type=Path, required=True)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--candidate-sha256", required=True, help="Externally trusted digest of original candidate JSON bytes")
    parser.add_argument("--source-commit", help="Optional independently frozen full Git commit")
    args = parser.parse_args(argv)
    result = verify_archive(args.candidate, args.archive, candidate_sha256=args.candidate_sha256,
                            expected_source_commit=args.source_commit)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, OSError, EOFError, tarfile.TarError, zlib.error) as error:
        # Never print untrusted archive member contents or environment values.
        print(json.dumps({"passed": False, "errorType": type(error).__name__}), file=sys.stderr)
        sys.exit(1)
