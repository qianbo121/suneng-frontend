import gzip
import hashlib
import io
import json
from pathlib import Path
import stat
import tarfile
import tempfile
import unittest
from unittest.mock import patch
import zipfile

import archive_transfer as transfer

SOURCE = 'e' * 40
TAG = 'suneng-verified-frontend:' + SOURCE


def digest(data):
    return hashlib.sha256(data).hexdigest()


def docker_tar(payload=b'layer contents', source=SOURCE):
    config = json.dumps({'rootfs': {'diff_ids': ['sha256:' + digest(payload)]},
                         'config': {'Labels': {'org.opencontainers.image.revision': source}}}, sort_keys=True).encode()
    image_id = 'sha256:' + digest(config)
    config_name = digest(config) + '.json'
    manifest = json.dumps([{'Config': config_name, 'RepoTags': [TAG], 'Layers': ['layer/layer.tar']}]).encode()
    stream = io.BytesIO()
    with tarfile.open(fileobj=stream, mode='w', format=tarfile.USTAR_FORMAT) as saved:
        for name, content in [(config_name, config), ('layer/layer.tar', payload), ('manifest.json', manifest)]:
            member = tarfile.TarInfo(name); member.size = len(content); member.mtime = 0
            saved.addfile(member, io.BytesIO(content))
    return stream.getvalue(), image_id, ['sha256:' + digest(payload)]


def official_zip(folder, name='official.zip', payload=b'layer contents', indexed=True,
                 compression=zipfile.ZIP_STORED, change=None, source=SOURCE):
    raw, image_id, layers = docker_tar(payload, source)
    archive = folder / (name + '.tar.gz')
    index = transfer.pack_stream(io.BytesIO(raw), archive, chunk_bytes=512) if indexed else None
    if not indexed:
        archive.write_bytes(gzip.compress(raw, mtime=0))
    candidate = {'schemaVersion': 1, 'status': 'candidate-not-deployed', 'sourceIdentity': 'git-commit',
                 'sourceCommit': SOURCE, 'imageTag': TAG, 'buildImageId': image_id, 'rootFsDiffIds': layers,
                 'imageBytes': len(payload), 'archiveBytes': archive.stat().st_size,
                 'archiveSha256': transfer.sha256(archive)}
    if index:
        candidate['archiveSegments'] = index
        candidate['archiveFormat'] = 'gzip-segments-v1'
    if change:
        candidate.update(change)
    output = folder / name
    with zipfile.ZipFile(output, 'w', compression=compression) as zipped:
        # Candidate first exercises exact preservation of JSON and ZIP local headers.
        zipped.writestr('candidate.json', json.dumps(candidate, indent=2) + '\n')
        zipped.write(archive, 'frontend.tar.gz')
    return output, transfer.sha256(output), candidate, raw


class ArchiveTransferTest(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.root = Path(self.folder.name).resolve()
        self.addCleanup(self.folder.cleanup)

    def test_deterministic_pack_preserves_exact_tar_bytes_and_segment_boundaries(self):
        raw, _, _ = docker_tar(b'a' * 2000)
        first, second = self.root / 'a.gz', self.root / 'b.gz'
        a = transfer.pack_stream(io.BytesIO(raw), first, chunk_bytes=512)
        b = transfer.pack_stream(io.BytesIO(raw), second, chunk_bytes=512)
        self.assertEqual(first.read_bytes(), second.read_bytes())
        self.assertEqual(a, b)
        self.assertEqual(gzip.decompress(first.read_bytes()), raw)
        with first.open('rb') as stream:
            joined = b''.join(gzip.decompress(transfer.read_exact(stream, part['bytes'])) for part in a['segments'])
        self.assertEqual(joined, raw)

    def test_verified_old_cache_reconstructs_exact_new_official_zip(self):
        old, old_hash, _, _ = official_zip(self.root, 'old.zip', b'x' * 16000)
        new, new_hash, candidate, _ = official_zip(self.root, 'new.zip', b'x' * 16000 + b'changed')
        cache = self.root / 'cache'
        transfer.seed_cache(old, old_hash, cache)
        bundle, received = self.root / 'bundle.zip', self.root / 'received.zip'
        result = transfer.create_bundle(new, new_hash, bundle, cache)
        self.assertEqual(result['mode'], 'segments')
        self.assertGreater(result['reusedSegments'], 0)
        transfer.receive_bundle(bundle, new_hash, received, cache)
        self.assertEqual(received.read_bytes(), new.read_bytes())
        with zipfile.ZipFile(received) as zipped:
            self.assertEqual(set(zipped.namelist()), {'candidate.json', 'frontend.tar.gz'})
            self.assertEqual(json.loads(zipped.read('candidate.json')), candidate)

    def test_legacy_no_cache_and_compressed_official_zip_fall_back_to_full(self):
        old, old_hash, _, _ = official_zip(self.root, 'old.zip')
        cache = self.root / 'cache'; transfer.seed_cache(old, old_hash, cache)
        for label, indexed, compression, use_cache in [('legacy', False, zipfile.ZIP_STORED, cache),
                 ('no-cache', True, zipfile.ZIP_STORED, None), ('missing-cache', True, zipfile.ZIP_STORED, self.root / 'absent'), ('deflated', True, zipfile.ZIP_DEFLATED, cache)]:
            with self.subTest(label=label):
                official, sha, _, _ = official_zip(self.root, label + '.zip', indexed=indexed, compression=compression)
                bundle = self.root / (label + '-bundle.zip'); received = self.root / (label + '-received.zip')
                self.assertEqual(transfer.create_bundle(official, sha, bundle, use_cache)['mode'], 'full')
                transfer.receive_bundle(bundle, sha, received, use_cache)
                self.assertEqual(received.read_bytes(), official.read_bytes())

    def test_corrupt_cache_is_resent_and_never_reused(self):
        official, sha, candidate, _ = official_zip(self.root, payload=b'x' * 3000)
        cache = self.root / 'cache'; transfer.seed_cache(official, sha, cache)
        segment = candidate['archiveSegments']['segments'][0]
        (cache / (segment['sha256'] + '.gz')).write_bytes(b'broken')
        bundle, received = self.root / 'bundle.zip', self.root / 'received.zip'
        result = transfer.create_bundle(official, sha, bundle, cache)
        self.assertEqual(result['mode'], 'segments')
        with zipfile.ZipFile(bundle) as zipped:
            self.assertIn('segments/' + segment['sha256'] + '.gz', zipped.namelist())
        transfer.receive_bundle(bundle, sha, received, cache)
        self.assertEqual(received.read_bytes(), official.read_bytes())

    def test_cache_corrupted_after_bundle_requires_resend_and_leaves_no_output(self):
        official, sha, candidate, _ = official_zip(self.root)
        cache = self.root / 'cache'; transfer.seed_cache(official, sha, cache)
        bundle, received = self.root / 'bundle.zip', self.root / 'received.zip'
        transfer.create_bundle(official, sha, bundle, cache)
        part = candidate['archiveSegments']['segments'][0]
        (cache / (part['sha256'] + '.gz')).write_bytes(b'broken')
        with self.assertRaisesRegex(ValueError, 'resend'):
            transfer.receive_bundle(bundle, sha, received, cache)
        self.assertFalse(received.exists()); self.assertFalse(received.with_suffix('.zip.partial').exists())

    def test_unregistered_cache_files_cannot_enable_reuse(self):
        official, sha, _, _ = official_zip(self.root)
        cache = self.root / 'cache'; transfer.seed_cache(official, sha, cache)
        (cache / 'verified.json').write_text(json.dumps({'schemaVersion': 1, 'archives': {}}))
        result = transfer.create_bundle(official, sha, self.root / 'bundle.zip', cache)
        self.assertEqual(result['mode'], 'full')

    def test_untrusted_official_digest_and_receipt_mismatch_are_rejected(self):
        official, sha, _, _ = official_zip(self.root)
        with self.assertRaisesRegex(ValueError, 'Official ZIP digest'):
            transfer.seed_cache(official, '0' * 64, self.root / 'cache')
        bundle = self.root / 'bundle.zip'
        transfer.create_bundle(official, sha, bundle)
        with self.assertRaisesRegex(ValueError, 'identity'):
            transfer.receive_bundle(bundle, '0' * 64, self.root / 'received.zip')

    def test_candidate_archive_config_source_and_layers_are_verified(self):
        for label, change, source in [('archive', {'archiveSha256': '0' * 64}, SOURCE),
                ('image', {'buildImageId': 'sha256:' + '0' * 64}, SOURCE),
                ('layers', {'rootFsDiffIds': ['sha256:' + '0' * 64]}, SOURCE),
                ('source', None, 'a' * 40), ('contract', {'imageTag': 'frontend:latest'}, SOURCE)]:
            with self.subTest(label=label):
                official, sha, _, _ = official_zip(self.root, label + '.zip', change=change, source=source)
                with self.assertRaises(ValueError):
                    transfer.seed_cache(official, sha, self.root / (label + '-cache'))

    def test_tampered_segment_index_is_rejected(self):
        official, sha, candidate, _ = official_zip(self.root)
        candidate['archiveSegments']['segments'][0]['offset'] = 1
        bad, bad_sha, _, _ = official_zip(self.root, 'bad.zip', change={'archiveSegments': candidate['archiveSegments']})
        with self.assertRaisesRegex(ValueError, 'segment'):
            transfer.create_bundle(bad, bad_sha, self.root / 'bundle.zip')

    def test_unsafe_zip_paths_symlinks_and_extra_members_are_rejected(self):
        for label in ['traversal', 'symlink', 'extra']:
            with self.subTest(label=label):
                official, _, _, _ = official_zip(self.root, label + '.zip')
                with zipfile.ZipFile(official, 'a') as zipped:
                    name = '../unsafe' if label == 'traversal' else 'unexpected'
                    info = zipfile.ZipInfo(name)
                    if label == 'symlink':
                        info.create_system = 3; info.external_attr = (stat.S_IFLNK | 0o777) << 16
                    zipped.writestr(info, b'anything')
                with self.assertRaises(ValueError):
                    transfer.seed_cache(official, transfer.sha256(official), self.root / (label + '-cache'))

    def test_symlink_cache_or_output_and_traversing_path_are_rejected(self):
        official, sha, candidate, _ = official_zip(self.root)
        cache = self.root / 'cache'; transfer.seed_cache(official, sha, cache)
        part = cache / (candidate['archiveSegments']['segments'][0]['sha256'] + '.gz')
        part.unlink(); part.symlink_to(official)
        with self.assertRaisesRegex(ValueError, 'Symlink'):
            transfer.create_bundle(official, sha, self.root / 'bundle.zip', cache)
        target = self.root / 'target'; target.symlink_to(official)
        with self.assertRaisesRegex(ValueError, 'Symlink'):
            transfer.create_bundle(official, sha, target)
        with self.assertRaisesRegex(ValueError, 'traversal'):
            transfer.create_bundle(official, sha, self.root / 'other' / '..' / 'bad.zip')

    def test_bad_segment_and_modified_reconstructed_zip_are_rejected(self):
        official, sha, candidate, _ = official_zip(self.root)
        cache = self.root / 'cache'; transfer.seed_cache(official, sha, cache)
        original_bundle = self.root / 'bundle.zip'; transfer.create_bundle(official, sha, original_bundle, cache)
        for label in ['segment', 'suffix']:
            damaged = self.root / (label + '.zip')
            with zipfile.ZipFile(original_bundle) as original, zipfile.ZipFile(damaged, 'w') as output:
                for name in original.namelist():
                    data = original.read(name)
                    if label == 'suffix' and name == 'suffix':
                        data = bytes([data[0] ^ 1]) + data[1:]
                    output.writestr(name, data)
                if label == 'segment':
                    item = candidate['archiveSegments']['segments'][0]
                    output.writestr('segments/' + item['sha256'] + '.gz', b'x' * item['bytes'])
            with self.assertRaisesRegex(ValueError, 'digest'):
                transfer.receive_bundle(damaged, sha, self.root / (label + '-received.zip'), cache)

    def test_truncated_stream_is_rejected(self):
        raw, _, _ = docker_tar(b'x' * 1000)
        with self.assertRaises((ValueError, tarfile.TarError)):
            transfer.pack_stream(io.BytesIO(raw[:600]), self.root / 'bad.gz')

    def test_concurrent_destination_is_never_overwritten(self):
        official, sha, _, _ = official_zip(self.root, indexed=False)
        bundle, received = self.root / 'bundle.zip', self.root / 'received.zip'
        transfer.create_bundle(official, sha, bundle)
        real_link = transfer.os.link

        def concurrent_writer(source, destination, **kwargs):
            received.write_bytes(b'another task owns this file')
            return real_link(source, destination, **kwargs)

        with patch.object(transfer.os, 'link', side_effect=concurrent_writer):
            with self.assertRaises(FileExistsError):
                transfer.receive_bundle(bundle, sha, received)
        self.assertEqual(received.read_bytes(), b'another task owns this file')
        self.assertFalse(list(self.root.glob('received.zip.*.partial')))


if __name__ == '__main__':
    unittest.main()
