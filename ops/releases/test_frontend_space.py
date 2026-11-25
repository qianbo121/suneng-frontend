import gzip
import subprocess
from types import SimpleNamespace
from contextlib import redirect_stdout

import retire_packages
import io
from pathlib import Path
import random
import tempfile
import unittest
from unittest.mock import patch

import archive_transfer
import frontend_history
import test_archive_identity as fixtures
import transfer_frontend


def release(root, label, picture):
    root.mkdir()
    original = fixtures.layer_tar
    index = {}
    def layer(name, _):
        return original(name, picture if name == 'first.txt' else label.encode())
    def segmented(raw):
        output = root / 'segmented.gz'
        index.update(archive_transfer.pack_stream(io.BytesIO(gzip.decompress(raw)), output))
        return output.read_bytes()
    with patch.object(fixtures, 'layer_tar', side_effect=layer):
        candidate = fixtures.Fixture(root, outer_edit=segmented)
    candidate.value['archiveSegments'] = index
    candidate.save_candidate()
    return candidate


class FrontendSpaceTests(unittest.TestCase):
    def test_changed_copy_shares_images_and_each_official_version_can_be_restored(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp).resolve()
            picture = random.Random(17).randbytes(4 * 1024 * 1024)
            old = release(root / 'old', 'Old product caption', picture)
            new = release(root / 'new', 'Reviewed product caption', picture)
            store, stage = root / 'history', root / 'staging'
            store.mkdir()
            stage.mkdir()
            for candidate in (old, new):
                result = frontend_history.keep(store, candidate.candidate, candidate.archive, candidate.candidate_sha)
                if candidate is new:
                    self.assertGreater(result['reusedBytes'], result['archiveBytes'] * .95)
                out = root / (candidate.candidate_sha + '.gz')
                frontend_history.restore(store, candidate.candidate_sha, out)
                self.assertEqual(archive_transfer.sha256(out), candidate.value['archiveSha256'])
            thin = root / 'new-release.zip'
            delta = frontend_history.make_delta(store, new.candidate_sha, old.candidate_sha, thin)
            self.assertLess(delta['transferBytes'], delta['archiveBytes'] * .05)
            receiver = root / 'receiver'
            receiver.mkdir()
            full = root / 'rehydrated.tar.gz'
            with self.assertRaises((ValueError, FileNotFoundError)):
                frontend_history.accept_delta(receiver, new.candidate_sha, thin, full)
            self.assertFalse(full.exists())
            frontend_history.keep(receiver, old.candidate, old.archive, old.candidate_sha)
            frontend_history.accept_delta(receiver, new.candidate_sha, thin, full)
            retry = frontend_history.accept_delta(receiver, new.candidate_sha, thin, full)
            self.assertTrue(retry['verified'])
            self.assertEqual(archive_transfer.sha256(full), new.value['archiveSha256'])
            transferred = transfer_frontend.stage(new.archive, new.candidate, new.candidate_sha, stage, old.directory)
            self.assertGreater(transferred['reusedBytes'], transferred['archiveBytes'] * .95)
            retry = transfer_frontend.stage(new.archive, new.candidate, new.candidate_sha, stage, old.directory)
            self.assertEqual(retry['literalBytes'], 0)
            with self.assertRaises(subprocess.CalledProcessError):
                transfer_frontend.stage(old.archive, old.candidate, old.candidate_sha, stage, new.directory)
            self.assertEqual(archive_transfer.sha256(stage / 'frontend.tar.gz'), new.value['archiveSha256'])
            self.assertTrue(old.verify()['passed'])
            part = next((store / 'segments').iterdir())
            part.write_bytes(b'corrupt')
            path = root / 'failed.gz'
            affected = next(c for c in [old,new] if any(x['sha256'] == part.name for x in c.value['archiveSegments']['segments']))
            with self.assertRaises(ValueError):
                frontend_history.restore(store, affected.candidate_sha, path)
            self.assertFalse(path.exists())

    def test_capacity_retirement_protects_boundary_and_verifies_independent_files(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp).resolve()
            archive = root / 'remote'
            archive.mkdir()
            a, b = 'a' * 40, 'b' * 40
            versions = {'shuju': ({a, b}, {b, 'c' * 40})}
            def source(name):
                return Path('/opt/shuju/releases/shuju-engine-' + name + '.tar.gz')
            def row(name):
                return {'sourceCommit': name, 'sha256': '0' * 64}
            self.assertTrue(retire_packages.confirmed_package(row(a), source(a), versions))
            self.assertFalse(retire_packages.confirmed_package(row(b), source(b), versions))
            self.assertFalse(retire_packages.confirmed_package(row(a), source(b), versions))

            rows = []
            for name in ['old-a', 'old-b']:
                original, duplicate = root / name, archive / name
                original.write_bytes(name.encode())
                duplicate.write_bytes(original.read_bytes())
                rows.append({'path': str(original), 'archiveCopy': str(duplicate),
                             'sha256': archive_transfer.sha256(original)})
            target = (root / 'old-a').stat().st_blocks * 512
            options = dict(eligible=lambda *_: True, in_use=lambda _: False,
                           disk_usage=lambda _: SimpleNamespace(free=0))
            with self.assertRaisesRegex(ValueError, 'independent filesystem'):
                retire_packages.retire(rows, archive, target, False, {}, **options)
            real_stat = Path.stat
            def separate_device(path, *args, **kwargs):
                real = real_stat(path, *args, **kwargs)
                if archive not in path.parents:
                    return real
                class Result:
                    st_dev = real.st_dev + 1
                    def __getattr__(self, attr):
                        return getattr(real, attr)
                return Result()
            # Simulate a mounted external disk for the device check while retaining
            # full reads and the real paths, digests and sizes of both copies.
            original_verify = retire_packages._verified_file
            def verified(path, digest, size):
                if archive not in path.parents:
                    return original_verify(path, digest, size)
                with patch.object(Path, 'stat', real_stat):
                    original_verify(path, digest, size)
                return path.stat(), b''
            with patch.object(Path, 'stat', separate_device), patch.object(retire_packages, '_verified_file', verified):
                plan = retire_packages.retire(rows, archive, target, False, {}, **options)
                self.assertEqual(len(plan), 1)
                self.assertFalse(plan[0]['removed'])
                (archive / 'old-a').write_bytes(b'bad!!')
                with self.assertRaises(ValueError):
                    retire_packages.retire(rows, archive, target, True, {}, **options)
                self.assertTrue((root / 'old-a').exists())
                (archive / 'old-a').write_bytes((root / 'old-a').read_bytes())
                options['disk_usage'] = lambda _: SimpleNamespace(free=target if not (root / 'old-a').exists() else 0)
                with redirect_stdout(io.StringIO()):
                    actual = retire_packages.retire(rows, archive, target, True, {}, **options)
                self.assertEqual(len(actual), 1)
                self.assertFalse((root / 'old-a').exists())
                self.assertTrue((root / 'old-b').exists())
                self.assertTrue((archive / 'old-a').exists())
