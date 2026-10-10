"""Small actual OCI archives exercise integrity, EOF, identity and read order."""
import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile
import unittest
import zlib
from unittest import mock

import archive_identity as identity

SOURCE = "a" * 40
TAG = "suneng-verified-frontend:" + SOURCE


def raw_json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode()


def sha(value):
    return hashlib.sha256(value).hexdigest()


def image_id(value):
    return "sha256:" + sha(value)


def blob(value):
    return "blobs/sha256/" + sha(value)



def pax_record(key, value):
    content = f" {key}={value}\n".encode()
    size = len(content) + 1
    while len(str(size)) + len(content) != size:
        size = len(str(size)) + len(content)
    return str(size).encode() + content


def layer_tar(name, content):
    out = io.BytesIO()
    with tarfile.open(fileobj=out, mode="w", format=tarfile.USTAR_FORMAT) as saved:
        member = tarfile.TarInfo(name)
        member.size = len(content)
        saved.addfile(member, io.BytesIO(content))
    return out.getvalue()


class Fixture:
    def __init__(self, directory, *, compressed=False, config_edit=None, manifest_edit=None,
                 index_edit=None, docker_edit=None, entries_edit=None, outer_edit=None,
                 encoded_edit=None, image_bytes=None):
        self.directory = Path(directory)
        self.archive = self.directory / "frontend.tar.gz"
        self.candidate = self.directory / "candidate.json"
        raw_layers = [layer_tar("first.txt", b"alpha" * 4096), layer_tar("second.txt", b"beta" * 3072)]
        encoded = [gzip.compress(x, mtime=0) if compressed else x for x in raw_layers]
        if encoded_edit:
            encoded_edit(encoded)
        roots = [image_id(x) for x in raw_layers]
        config = {"architecture": "amd64", "os": "linux", "rootfs": {"type": "layers", "diff_ids": roots},
                  "config": {"Labels": {"org.opencontainers.image.revision": SOURCE}}}
        if config_edit:
            config_edit(config)
        config_raw = raw_json(config)
        config_descriptor = {"mediaType": "application/vnd.oci.image.config.v1+json",
                             "digest": image_id(config_raw), "size": len(config_raw)}
        layers = [{"mediaType": "application/vnd.oci.image.layer.v1.tar" + ("+gzip" if compressed else ""),
                   "digest": image_id(x), "size": len(x)} for x in encoded]
        manifest = {"schemaVersion": 2, "mediaType": "application/vnd.oci.image.manifest.v1+json",
                    "config": config_descriptor, "layers": layers}
        if manifest_edit:
            manifest_edit(manifest)
        manifest_raw = raw_json(manifest)
        index = {"schemaVersion": 2, "manifests": [{"mediaType": manifest["mediaType"],
                 "digest": image_id(manifest_raw), "size": len(manifest_raw),
                 "platform": {"architecture": "amd64", "os": "linux"}}]}
        if index_edit:
            index_edit(index)
        docker = [{"Config": blob(config_raw), "RepoTags": [TAG], "Layers": [blob(x) for x in encoded]}]
        if docker_edit:
            docker_edit(docker)
        # Physical blob order deliberately differs from the manifest's layer order.
        entries = [(blob(x), x, tarfile.REGTYPE) for x in reversed(encoded)] + [
            (blob(config_raw), config_raw, tarfile.REGTYPE),
            (blob(manifest_raw), manifest_raw, tarfile.REGTYPE),
            ("manifest.json", raw_json(docker), tarfile.REGTYPE),
            ("oci-layout", raw_json({"imageLayoutVersion": "1.0.0"}), tarfile.REGTYPE),
            ("index.json", raw_json(index), tarfile.REGTYPE)]
        if entries_edit:
            entries_edit(entries)
        tar_raw = io.BytesIO()
        with tarfile.open(fileobj=tar_raw, mode="w", format=tarfile.USTAR_FORMAT) as saved:
            for name, data, kind in entries:
                member = tarfile.TarInfo(name)
                member.type = kind
                member.size = len(data) if kind == tarfile.REGTYPE or kind in identity.EXTENSION_TYPES else 0
                if kind in (tarfile.SYMTYPE, tarfile.LNKTYPE):
                    member.linkname = "manifest.json"
                saved.addfile(member, io.BytesIO(data) if member.size else None)
        raw = gzip.compress(tar_raw.getvalue(), mtime=0)
        if outer_edit:
            raw = outer_edit(raw)
        self.archive.write_bytes(raw)
        self.value = {"schemaVersion": 1, "status": "candidate-not-deployed", "sourceIdentity": "git-commit",
                      "sourceCommit": SOURCE, "imageTag": TAG, "buildImageId": image_id(config_raw),
                      "rootFsDiffIds": roots, "imageBytes": image_bytes or sum(map(len, raw_layers)),
                      "archiveBytes": len(raw), "archiveSha256": sha(raw)}
        self.runtime = image_id(manifest_raw)
        self.outer_bytes = len(tar_raw.getvalue())
        self.payload_bytes = sum(len(x[1]) for x in entries if x[2] == tarfile.REGTYPE)
        self.save_candidate()

    def save_candidate(self):
        self.raw = raw_json(self.value)
        self.candidate.write_bytes(self.raw)
        self.candidate_sha = sha(self.raw)

    def verify(self, **kwargs):
        return identity.verify_archive(self.candidate, self.archive, candidate_sha256=self.candidate_sha,
                                       expected_source_commit=SOURCE, **kwargs)


class ArchiveIdentityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.directory = Path(self.temp.name).resolve()

    def tearDown(self):
        self.temp.cleanup()

    def fixture(self, **kwargs):
        return Fixture(self.directory, **kwargs)

    def rejected(self, fixture, pattern=None):
        if pattern:
            with self.assertRaisesRegex(ValueError, pattern):
                fixture.verify()
        else:
            with self.assertRaises((ValueError, EOFError, OSError, tarfile.TarError, zlib.error)):
                fixture.verify()

    def test_raw_layers_distinguish_config_and_runtime_and_hash_every_payload(self):
        fixture = self.fixture()
        proof = fixture.verify()
        self.assertTrue(proof["passed"])
        self.assertEqual(proof["candidateSha256"], fixture.candidate_sha)
        self.assertEqual(proof["imageIdentity"]["buildConfigurationId"], fixture.value["buildImageId"])
        self.assertEqual(proof["imageIdentity"]["ociRuntimeManifestDigest"], fixture.runtime)
        self.assertNotEqual(fixture.value["buildImageId"], fixture.runtime)
        self.assertEqual(proof["imageIdentity"]["rootFsDiffIds"], fixture.value["rootFsDiffIds"])
        self.assertEqual(proof["imageIdentity"]["dockerRepoTags"], [TAG])
        self.assertTrue(all(x["passed"] and not x["gzip"] for x in proof["imageIdentity"]["layerBlobChecks"]))
        self.assertFalse(proof["serverImported"])
        self.assertFalse(proof["productionSwitched"])
        self.assertTrue(proof["completeGzipEofVerified"])

    def test_compressed_layers_verify_both_blob_digest_and_expanded_diff_ids(self):
        fixture = self.fixture(compressed=True)
        proof = fixture.verify()
        for layer in proof["imageIdentity"]["layerBlobChecks"]:
            self.assertTrue(layer["gzip"])
            self.assertNotEqual(layer["sha256"], layer["rootFsDiffId"])
            self.assertGreater(layer["expandedBytes"], layer["bytes"])

    def test_original_candidate_bytes_are_supported_and_dict_reserialization_rejected(self):
        fixture = self.fixture()
        result = identity.verify_archive(fixture.raw, fixture.archive, candidate_sha256=fixture.candidate_sha)
        self.assertTrue(result["passed"])
        with self.assertRaisesRegex(ValueError, "bytes-or-path"):
            identity.verify_archive(fixture.value, fixture.archive, candidate_sha256=fixture.candidate_sha)

    def test_external_candidate_digest_and_source_are_mandatory_exact_values(self):
        fixture = self.fixture()
        for digest in ("", "0" * 64, "sha256:" + fixture.candidate_sha, None):
            with self.subTest(digest=digest), self.assertRaises(ValueError):
                identity.verify_archive(fixture.raw, fixture.archive, candidate_sha256=digest)
        for source in (SOURCE[:8], "b" * 40):
            with self.subTest(source=source), self.assertRaises(ValueError):
                identity.verify_archive(fixture.raw, fixture.archive, candidate_sha256=fixture.candidate_sha,
                                        expected_source_commit=source)

    def test_invalid_candidate_contract_rejected_before_archive_scan(self):
        fixture = self.fixture()
        for key, value in (("sourceCommit", "main"), ("status", "deployed"), ("archiveBytes", True),
                           ("imageBytes", 0), ("buildImageId", fixture.runtime[7:]), ("rootFsDiffIds", []),
                           ("imageTag", "unreviewed:latest"), ("schemaVersion", True)):
            bad = dict(fixture.value, **{key: value})
            raw = raw_json(bad)
            with self.subTest(key=key), mock.patch.object(identity, "_scan") as scan:
                with self.assertRaises(ValueError):
                    identity.verify_archive(raw, fixture.archive, candidate_sha256=sha(raw))
                scan.assert_not_called()

    def test_archive_checksum_and_size_rejected_before_decompression(self):
        fixture = self.fixture()
        for key, value in (("archiveSha256", "0" * 64), ("archiveBytes", fixture.value["archiveBytes"] + 1)):
            bad = dict(fixture.value, **{key: value})
            raw = raw_json(bad)
            with self.subTest(key=key), mock.patch.object(identity, "_scan") as scan:
                with self.assertRaises(ValueError):
                    identity.verify_archive(raw, fixture.archive, candidate_sha256=sha(raw))
                scan.assert_not_called()

    def test_blob_payload_tamper_is_rejected_even_with_new_outer_digest(self):
        def tamper(entries):
            name, data, kind = entries[0]
            entries[0] = (name, data[:-1] + b"x", kind)
        self.rejected(self.fixture(entries_edit=tamper), "blob-filename-digest")

    def test_wrong_platform_source_and_rootfs_rejected(self):
        edits = [lambda config: config.update(architecture="arm64"),
                 lambda config: config["config"]["Labels"].update({"org.opencontainers.image.revision": "b" * 40}),
                 lambda config: config["rootfs"].update(diff_ids=["sha256:" + "0" * 64] * 2)]
        for edit in edits:
            with self.subTest(edit=edit):
                self.rejected(self.fixture(config_edit=edit), "platform-source-rootfs")

    def test_config_chain_digest_and_descriptor_size_rejected(self):
        edits = [lambda manifest: manifest["config"].update(digest="sha256:" + "0" * 64),
                 lambda manifest: manifest["config"].update(size=1),
                 lambda manifest: manifest["layers"][0].update(size=True)]
        for edit in edits:
            with self.subTest(edit=edit):
                self.rejected(self.fixture(manifest_edit=edit))

    def test_expanded_diff_id_checked_after_matching_config_and_candidate(self):
        fixture = self.fixture(config_edit=lambda config: config["rootfs"].update(diff_ids=["sha256:" + "0" * 64] * 2))
        fixture.value["rootFsDiffIds"] = ["sha256:" + "0" * 64] * 2
        fixture.save_candidate()
        self.rejected(fixture, "expanded-rootfs")

    def test_extra_OCI_images_and_wrong_index_platform_rejected(self):
        for edit in (lambda index: index["manifests"].append(dict(index["manifests"][0])),
                     lambda index: index["manifests"][0]["platform"].update(architecture="arm64")):
            with self.subTest(edit=edit):
                self.rejected(self.fixture(index_edit=edit))

    def test_extra_Docker_images_tags_or_layer_order_rejected(self):
        edits = [lambda docker: docker.append(dict(docker[0])),
                 lambda docker: docker[0]["RepoTags"].append("unexpected:latest"),
                 lambda docker: docker[0]["Layers"].reverse(),
                 lambda docker: docker[0].update(Config="unbound.json")]
        for edit in edits:
            with self.subTest(edit=edit):
                self.rejected(self.fixture(docker_edit=edit), "single-Docker")

    def test_layer_compression_media_must_match_actual_bytes(self):
        fixture = self.fixture(compressed=True, manifest_edit=lambda manifest: manifest["layers"][0].update(
            mediaType="application/vnd.oci.image.layer.v1.tar"))
        self.rejected(fixture, "expanded-rootfs")

    def test_duplicate_unsafe_and_link_members_rejected(self):
        edits = [lambda entries: entries.append(entries[0]),
                 lambda entries: entries.append(("../escape", b"bad", tarfile.REGTYPE)),
                 lambda entries: entries.append(("/absolute", b"bad", tarfile.REGTYPE)),
                 lambda entries: entries.append(("safe\\escape", b"bad", tarfile.REGTYPE)),
                 lambda entries: entries.append(("link", b"", tarfile.SYMTYPE)),
                 lambda entries: entries.append(("hardlink", b"", tarfile.LNKTYPE)),
                 lambda entries: entries.append(("device", b"", tarfile.CHRTYPE))]
        for edit in edits:
            with self.subTest(edit=edit):
                self.rejected(self.fixture(entries_edit=edit))

    def test_small_PAX_and_GNU_longname_are_compatible_and_counted(self):
        comment = pax_record("comment", "small accepted metadata")
        name = "extra/" + "n" * 150
        def extend(entries):
            entries.insert(0, ("pax", comment, tarfile.XHDTYPE))
            entries.extend([("longname", name.encode() + b"\0", tarfile.GNUTYPE_LONGNAME),
                            ("short-placeholder", b"extra", tarfile.REGTYPE)])
        fixture = self.fixture(entries_edit=extend)
        stats = fixture.verify()["scanStats"]
        self.assertEqual(stats["extensionHeaderCount"], 2)
        self.assertEqual(stats["extensionMetadataBytes"], len(comment) + len(name) + 1)
        self.assertEqual(stats["memberCount"], 10)
        self.assertEqual(stats["visibleMemberCount"], 8)
        self.assertEqual(stats["capturedMetadataBytes"],
                         stats["capturedImageMetadataBytes"] + stats["extensionMetadataBytes"])

    def test_oversized_PAX_and_GNU_extensions_rejected_before_builtin_parser(self):
        for kind in identity.EXTENSION_TYPES:
            data = (pax_record("comment", "x" * (identity.MAX_METADATA + 1))
                    if kind in (tarfile.XHDTYPE, tarfile.XGLTYPE, tarfile.SOLARIS_XHDTYPE)
                    else b"x" * (identity.MAX_METADATA + 1) + b"\0")
            fixture = self.fixture(entries_edit=lambda entries: entries.insert(0, ("extension", data, kind)))
            method = "_proc_pax" if kind in (tarfile.XHDTYPE, tarfile.XGLTYPE, tarfile.SOLARIS_XHDTYPE) else "_proc_gnulong"
            with self.subTest(kind=kind), mock.patch.object(tarfile.TarInfo, method,
                     side_effect=AssertionError("oversized extension reached parser")):
                self.rejected(fixture, "oversized-tar-extension")

    def test_cumulative_extension_metadata_limit_includes_hidden_headers(self):
        data = pax_record("comment", "x" * 60)
        def extend(entries):
            # Separate extension/file pairs avoid recursive parsing as a confounder.
            for index in range(4):
                entries.insert(2 * index, ("extension", data, tarfile.XHDTYPE))
                entries.insert(2 * index + 1, (f"extra-{index}", b"x", tarfile.REGTYPE))
        fixture = self.fixture(entries_edit=extend)
        with mock.patch.object(identity, "MAX_CAPTURED_METADATA", len(data) * 3):
            self.rejected(fixture, "metadata-memory-boundary")

    def test_hidden_extension_count_and_physical_member_count_are_bounded(self):
        data = pax_record("comment", "small")
        def extend(entries):
            entries[:0] = [("extension", data, tarfile.XHDTYPE)] * 4
        fixture = self.fixture(entries_edit=extend)
        with mock.patch.object(identity, "MAX_EXTENSION_HEADERS", 3):
            self.rejected(fixture, "too-many-tar-extension")
        with mock.patch.object(identity, "MAX_MEMBERS", 8):
            self.rejected(fixture, "too-many-tar-members")

    def test_extension_and_captured_image_metadata_share_cumulative_budget(self):
        data = pax_record("comment", "x" * 60)
        def extend(entries):
            # Previous image metadata must count when a later extension is parsed.
            entries.extend([("extension", data, tarfile.XHDTYPE), ("extra", b"x", tarfile.REGTYPE)])
        fixture = self.fixture(entries_edit=extend)
        baseline_bytes = self.fixture().verify()["scanStats"]["capturedImageMetadataBytes"]
        fixture = self.fixture(entries_edit=extend)
        with mock.patch.object(identity, "MAX_CAPTURED_METADATA", baseline_bytes + len(data) - 1):
            self.rejected(fixture, "metadata-memory-boundary")

    def test_complete_outer_gzip_trailer_checked_after_tar_end(self):
        # Candidate digest accurately binds each corrupt file; only EOF/CRC checking can reject it.
        for edit in (lambda raw: raw[:-7], lambda raw: raw[:-1] + bytes([raw[-1] ^ 1])):
            with self.subTest(edit=edit):
                self.rejected(self.fixture(outer_edit=edit))

    def test_missing_or_single_TAR_end_block_rejected_with_valid_outer_gzip(self):
        def truncate(raw, padding):
            data = gzip.decompress(raw)
            with tarfile.open(fileobj=io.BytesIO(data), mode="r:") as saved:
                last = list(saved)[-1]
            end = last.offset_data + ((last.size + 511) // 512) * 512
            return gzip.compress(data[:end + padding], mtime=0)
        for padding in (0, 512):
            with self.subTest(padding=padding):
                self.rejected(self.fixture(outer_edit=lambda raw: truncate(raw, padding)), "TAR-end-blocks")

    def test_nonzero_data_hidden_after_tar_end_rejected(self):
        self.rejected(self.fixture(outer_edit=lambda raw: gzip.compress(gzip.decompress(raw) + b"hidden-image", mtime=0)),
                      "nonzero-data-after-tar-end")

    def test_valid_segmented_outer_gzip_retains_full_EOF_verification(self):
        def segments(raw):
            expanded = gzip.decompress(raw)
            return gzip.compress(expanded[:777], mtime=0) + gzip.compress(expanded[777:], mtime=0)
        fixture = self.fixture(outer_edit=segments)
        self.assertTrue(fixture.verify()["completeGzipEofVerified"])

    def test_truncated_concatenated_or_corrupt_inner_gzip_rejected(self):
        edits = [lambda encoded: encoded.__setitem__(0, encoded[0][:-5]),
                 lambda encoded: encoded.__setitem__(0, encoded[0] + gzip.compress(b"trailing", mtime=0)),
                 lambda encoded: encoded.__setitem__(0, encoded[0][:-1] + bytes([encoded[0][-1] ^ 1]))]
        for edit in edits:
            with self.subTest(edit=edit):
                self.rejected(self.fixture(compressed=True, encoded_edit=edit))

    def test_compressed_layer_expansion_is_bounded(self):
        self.rejected(self.fixture(compressed=True, image_bytes=1), "layer-expansion-boundary")

    def test_symlink_hardlink_and_path_traversal_inputs_rejected(self):
        fixture = self.fixture()
        link = self.directory / "archive-link"
        link.symlink_to(fixture.archive)
        with self.assertRaisesRegex(ValueError, "unsafe-input"):
            identity.verify_archive(fixture.raw, link, candidate_sha256=fixture.candidate_sha)
        hardlink = self.directory / "archive-hardlink"
        os.link(fixture.archive, hardlink)
        with self.assertRaisesRegex(ValueError, "single-link"):
            fixture.verify()
        hardlink.unlink()
        with self.assertRaisesRegex(ValueError, "unsafe-input"):
            identity.verify_archive(fixture.raw, self.directory / "x" / ".." / "frontend.tar.gz",
                                    candidate_sha256=fixture.candidate_sha)

    def test_archive_change_and_candidate_change_during_scan_rejected(self):
        original = identity._scan
        fixture = self.fixture()
        def change_archive(stream, candidate):
            result = original(stream, candidate)
            info = fixture.archive.stat()
            os.utime(fixture.archive, ns=(info.st_atime_ns, info.st_mtime_ns + 1))
            return result
        with mock.patch.object(identity, "_scan", change_archive):
            self.rejected(fixture, "archive-changed")
        fixture = self.fixture()
        def change_candidate(stream, candidate):
            result = original(stream, candidate)
            fixture.candidate.write_bytes(fixture.raw + b" ")
            return result
        with mock.patch.object(identity, "_scan", change_candidate):
            self.rejected(fixture, "candidate-changed")

    def test_path_replacement_during_scan_rejected(self):
        fixture = self.fixture()
        original = identity._scan
        def replace_archive(stream, candidate):
            result = original(stream, candidate)
            replacement = self.directory / "replacement"
            replacement.write_bytes(fixture.archive.read_bytes())
            replacement.replace(fixture.archive)
            return result
        with mock.patch.object(identity, "_scan", replace_archive):
            self.rejected(fixture, "archive-changed")

    def test_duplicate_JSON_key_rejected(self):
        fixture = self.fixture()
        raw = fixture.raw[:-1] + b',"sourceCommit":"' + SOURCE.encode() + b'"}'
        with self.assertRaisesRegex(ValueError, "duplicate-JSON"):
            identity.verify_archive(raw, fixture.archive, candidate_sha256=sha(raw))

    def test_one_sequential_expansion_without_getmembers_or_gzip_seek(self):
        fixture = self.fixture()
        with mock.patch.object(tarfile.TarFile, "getmembers", side_effect=AssertionError("random member inventory")), \
                mock.patch.object(gzip.GzipFile, "seek", side_effect=AssertionError("gzip seek")):
            proof = fixture.verify()
        stats = proof["scanStats"]
        self.assertEqual(stats["archiveChecksumPasses"], 1)
        self.assertEqual(stats["sequentialTarPasses"], 1)
        self.assertEqual(stats["tarInputSeekCalls"], 0)
        self.assertEqual(stats["rawArchiveBytesHashed"], fixture.value["archiveBytes"])
        self.assertEqual(stats["outerExpandedBytesRead"], fixture.outer_bytes)
        self.assertEqual(stats["filePayloadBytesHashed"], fixture.payload_bytes)
        self.assertEqual(stats["memberCount"], 7)
        self.assertEqual(stats["rawArchiveRewindsBeforeTar"], 1)

    def test_CLI_outputs_full_bound_proof_and_failure_is_nonzero(self):
        fixture = self.fixture()
        args = [sys.executable, str(Path(identity.__file__)), "--candidate", str(fixture.candidate),
                "--archive", str(fixture.archive), "--candidate-sha256", fixture.candidate_sha,
                "--source-commit", SOURCE]
        run = subprocess.run(args, capture_output=True, text=True, check=True)
        proof = json.loads(run.stdout)
        self.assertEqual(proof["candidateSha256"], fixture.candidate_sha)
        self.assertEqual(proof["imageIdentity"]["ociRuntimeManifestDigest"], fixture.runtime)
        args[args.index("--candidate-sha256") + 1] = "0" * 64
        failed = subprocess.run(args, capture_output=True, text=True)
        self.assertNotEqual(failed.returncode, 0)
        self.assertEqual(failed.stdout, "")
        self.assertEqual(json.loads(failed.stderr), {"passed": False, "errorType": "ValueError"})


if __name__ == "__main__":
    unittest.main()
