import importlib.util
import io
import hashlib
import json
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('migration_backup', Path(__file__).with_name('backup_rehearsal.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
BATCH = '20260910T021000Z-abcdef12'


class BackupSafety(unittest.TestCase):
    def archive(self, name, kind=None):
        handle = tempfile.NamedTemporaryFile(suffix='.tar.gz', delete=False)
        path = Path(handle.name)
        handle.close()
        with tarfile.open(path, 'w:gz') as tar:
            info = tarfile.TarInfo(name)
            if kind:
                info.type = kind
                info.linkname = '/data/postgres'
                tar.addfile(info)
            else:
                info.size = 3
                tar.addfile(info, io.BytesIO(b'abc'))
        self.addCleanup(path.unlink)
        return path

    def test_only_identified_private_batches_are_allowed(self):
        self.assertEqual(m.valid_id(BATCH), BATCH)
        for value in ['../../uploads', 'latest', '/data/postgres', BATCH + '/..']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                m.valid_id(value)

    def test_uploaded_files_can_be_validated_without_extracting_them(self):
        m.validate_upload_archive(self.archive('uploads/2026/09/image.jpg'))

    def test_archive_cannot_escape_uploads_or_overwrite_runtime_data(self):
        for name in ['../postgres/db', '/data/postgres/db', 'uploads/../../postgres/db', 'website/.env.production']:
            with self.subTest(name=name), self.assertRaises(ValueError):
                m.validate_upload_archive(self.archive(name))

    def test_links_and_special_members_are_rejected(self):
        for kind in [tarfile.SYMTYPE, tarfile.LNKTYPE, tarfile.FIFOTYPE]:
            with self.subTest(kind=kind), self.assertRaises(ValueError):
                m.validate_upload_archive(self.archive('uploads/link', kind))

    def test_corrupted_backup_never_reaches_restore(self):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory) / 'database.dump'
            p.write_bytes(b'original')
            manifest = {'artifacts': [{'name': p.name, 'bytes': p.stat().st_size, 'sha256': m.sha(p)}]}
            m.verify_artifacts(Path(directory), manifest)
            p.write_bytes(b'changed!')
            with self.assertRaises(RuntimeError):
                m.verify_artifacts(Path(directory), manifest)

    def test_production_container_cannot_be_cleanup_target(self):
        with patch.object(m, 'run') as command, patch.object(m, 'output') as inspect:
            with self.assertRaises(ValueError):
                m.remove_owned_container('corp-site-postgres', BATCH)
            inspect.assert_not_called()
            command.assert_not_called()

    def test_matching_name_without_ownership_or_isolation_cannot_be_removed(self):
        name = 'suneng-geo-drill-' + BATCH
        for labels, network in [(None, 'none'), ({m.LABEL: BATCH}, 'bridge')]:
            fake = [{'Config': {'Labels': labels}, 'HostConfig': {'NetworkMode': network}}]
            with self.subTest(network=network), patch.object(m, 'output', return_value=json.dumps(fake)), patch.object(m, 'run') as command:
                with self.assertRaises(ValueError):
                    m.remove_owned_container(name, BATCH)
                command.assert_not_called()

    def test_mount_order_does_not_mask_a_real_production_change(self):
        a = [{'name': 'nginx', 'running': True, 'mounts': [{'source': '/data/uploads', 'destination': '/uploads', 'rw': False}, {'source': '/etc/certs', 'destination': '/certs', 'rw': False}]}]
        b = json.loads(json.dumps(a))
        b[0]['mounts'].reverse()
        self.assertTrue(m.same_state(a, b))
        b[0]['mounts'][0]['rw'] = True
        self.assertFalse(m.same_state(a, b))

    def oci_archive(self, omit_layer=False):
        blobs = {}
        def blob(data):
            body = json.dumps(data).encode() if isinstance(data, dict) else data
            digest = 'sha256:' + hashlib.sha256(body).hexdigest()
            blobs['blobs/sha256/' + digest.split(':')[1]] = body
            return digest
        config = blob({'architecture': 'amd64', 'os': 'linux'})
        layer = blob(b'original layer bytes')
        image = blob({'config': {'digest': config}, 'layers': [{'digest': layer}]})
        index = blob({'manifests': [{'digest': image, 'platform': {'architecture': 'amd64', 'os': 'linux'}}]})
        if omit_layer:
            del blobs['blobs/sha256/' + layer.split(':')[1]]
        blobs['index.json'] = json.dumps({'manifests': [{'digest': index}]}).encode()
        handle = tempfile.NamedTemporaryFile(suffix='.tar.gz', delete=False)
        path = Path(handle.name)
        handle.close()
        self.addCleanup(path.unlink)
        with tarfile.open(path, 'w:gz') as tar:
            for name, body in blobs.items():
                item = tarfile.TarInfo(name)
                item.size = len(body)
                tar.addfile(item, io.BytesIO(body))
        return path, index

    def test_image_identity_can_be_an_oci_index_not_the_config_digest(self):
        path, identity = self.oci_archive()
        result = m.verify_image_archive(path, {identity})
        self.assertTrue(result['identical'])
        self.assertEqual(result['verified_blob_count'], 4)

    def test_oci_identity_without_its_layer_cannot_pass(self):
        path, identity = self.oci_archive(omit_layer=True)
        with self.assertRaises(RuntimeError):
            m.verify_image_archive(path, {identity})

    def test_oci_archive_accepts_classic_docker_config_identity(self):
        path, _ = self.oci_archive()
        config_id = 'sha256:' + hashlib.sha256(json.dumps({'architecture': 'amd64', 'os': 'linux'}).encode()).hexdigest()
        result = m.verify_image_archive(path, {config_id})
        self.assertTrue(result['identical'])
        self.assertEqual(result['verified_blob_count'], 4)

    def test_config_identity_does_not_bypass_missing_layer(self):
        path, _ = self.oci_archive(omit_layer=True)
        config_id = 'sha256:' + hashlib.sha256(json.dumps({'architecture': 'amd64', 'os': 'linux'}).encode()).hexdigest()
        with self.assertRaises(RuntimeError):
            m.verify_image_archive(path, {config_id})

    def test_unrelated_image_identity_is_rejected(self):
        path, _ = self.oci_archive()
        with self.assertRaises(RuntimeError):
            m.verify_image_archive(path, {'sha256:' + '0' * 64})

    def test_uncompressed_archive_receives_the_same_integrity_checks(self):
        import gzip
        path, identity = self.oci_archive()
        with tempfile.TemporaryDirectory() as directory:
            plain = Path(directory) / 'images.tar'
            plain.write_bytes(gzip.decompress(path.read_bytes()))
            self.assertTrue(m.verify_image_archive(plain, {identity})['identical'])
            plain.write_bytes(plain.read_bytes().replace(b'original layer bytes', b'corrupt! layer bytes'))
            with self.assertRaises(RuntimeError):
                m.verify_image_archive(plain, {identity})

    def test_database_data_root_is_the_mount_root_not_an_inaccessible_child(self):
        database_dir = m.PARENT / BATCH / 'restore-drill-2' / 'postgres'
        command = m.drill_container_args('sha256:test', BATCH, database_dir)
        self.assertIn('PGDATA=/var/lib/postgresql/data', command)
        self.assertIn('type=bind,src=' + str(database_dir) + ',dst=/var/lib/postgresql/data', command)
        self.assertNotIn('-p', command)
        self.assertEqual(command[command.index('--network') + 1], 'none')
        with self.assertRaises(ValueError):
            m.drill_container_args('sha256:test', BATCH, Path('/data/postgres'))

    def test_owned_networkless_drill_can_be_cleaned(self):
        name = 'suneng-geo-drill-' + BATCH
        fake = [{'Config': {'Labels': {m.LABEL: BATCH}}, 'HostConfig': {'NetworkMode': 'none'}}]
        with patch.object(m, 'output', return_value=json.dumps(fake)), patch.object(m, 'run') as command:
            m.remove_owned_container(name, BATCH)
            self.assertEqual(command.call_args.args[0], ['docker', 'rm', '-f', name])


if __name__ == '__main__':
    unittest.main(verbosity=2)
