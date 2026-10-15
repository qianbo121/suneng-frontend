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

    def production_records(self):
        rows = [{'name': name, 'running': True, 'image': 'sha256:' + 'a'*64, 'mounts': []} for name in m.PRODUCTION]
        mapping = {x['name']: x for x in rows}
        for name, source, destination in [('corp-site-postgres', '/data/postgres', '/var/lib/postgresql/data'), ('corp-site-backend', '/data/uploads', '/app/uploads'), ('corp-site-nginx', '/data/uploads', '/var/www/uploads')]:
            mapping[name]['mounts'].append({'source': source, 'destination': destination, 'rw': True})
        return rows

    def test_retired_admin_requires_explicit_identity_and_stopped_state(self):
        rows = self.production_records()
        admin = next(x for x in rows if x['name'] == 'corp-site-admin')
        admin['running'] = False
        with patch.object(m, 'retired_admin_image', return_value=admin['image']):
            m.verify_production(rows)
            for field, value in [('running', True), ('image', 'sha256:' + 'b'*64)]:
                changed = json.loads(json.dumps(rows));next(x for x in changed if x['name'] == 'corp-site-admin')[field] = value
                with self.subTest(field=field), self.assertRaises(RuntimeError):m.verify_production(changed)

    def test_retirement_never_allows_other_missing_or_stopped_services(self):
        rows = self.production_records();next(x for x in rows if x['name'] == 'corp-site-admin')['running'] = False
        with patch.object(m, 'retired_admin_image', return_value='sha256:' + 'a'*64):
            for name in m.PRODUCTION:
                with self.subTest(missing=name), self.assertRaises(RuntimeError):m.verify_production([x for x in rows if x['name'] != name])
            for name in ['corp-site-postgres', 'corp-site-backend', 'corp-site-frontend', 'corp-site-nginx']:
                changed = json.loads(json.dumps(rows));next(x for x in changed if x['name'] == name)['running'] = False
                with self.subTest(stopped=name), self.assertRaises(RuntimeError):m.verify_production(changed)
        with patch.object(m, 'retired_admin_image', return_value=None), self.assertRaises(RuntimeError):m.verify_production(rows)

    def test_state_records_removed_retired_admin_and_verifies_retained_image(self):
        image = 'sha256:' + 'a'*64
        rows = self.production_records()
        raw = [{'Name': '/' + row['name'], 'Image': row['image'],
                'State': {'StartedAt': '2026-10-15T00:00:00Z', 'Running': True},
                'Config': {'Labels': {}}, 'Mounts': [
                    {'Source': x['source'], 'Destination': x['destination'], 'RW': True}
                    for x in row['mounts']]} for row in rows if row['name'] != 'corp-site-admin']
        replies = ['', json.dumps([{'Id': image, 'Config': {'Labels': {}}}]), json.dumps(raw)]
        with patch.object(m, 'retired_admin_image', return_value=image), patch.object(m, 'output', side_effect=replies) as command:
            observed = m.state()
            m.verify_production(observed)
            self.assertNotIn('corp-site-admin', command.call_args_list[-1].args[0][2:])
        admin = next(x for x in observed if x['name'] == 'corp-site-admin')
        self.assertIs(admin['container_present'], False)
        self.assertIs(admin['retired_recovery_image_verified'], True)
        self.assertFalse(admin['running'])
        changed = json.loads(json.dumps(observed))
        next(x for x in changed if x['name'] == 'corp-site-admin')['container_present'] = True
        self.assertFalse(m.same_state(observed, changed))
        with patch.object(m, 'retired_admin_image', return_value=None), self.assertRaises(RuntimeError):
            m.verify_production(observed)
        for field, value in [('retired_recovery_image_verified', False), ('image', 'sha256:'+'b'*64)]:
            changed = json.loads(json.dumps(observed))
            next(x for x in changed if x['name'] == 'corp-site-admin')[field] = value
            with patch.object(m, 'retired_admin_image', return_value=image), self.subTest(field=field), self.assertRaises(RuntimeError):
                m.verify_production(changed)

    def test_removed_retired_admin_without_recovery_image_is_rejected(self):
        image = 'sha256:' + 'a'*64
        for images in [[], [{'Id': 'sha256:'+'b'*64}]]:
            with patch.object(m, 'retired_admin_image', return_value=image), patch.object(m, 'output', side_effect=['', json.dumps(images)]), self.subTest(images=images), self.assertRaises(RuntimeError):
                m.state()

    def test_retirement_receipt_is_validated_and_symlink_refused(self):
        image = 'sha256:' + 'a'*64
        receipt = {'retiredComponents': {'admin': {'status': 'retired', 'retiredAt': '2026-10-12', 'image': image}}, 'adminRelease': {'image': image}, 'images': {}}
        with tempfile.TemporaryDirectory() as directory, patch.object(m, 'ROOT', Path(directory)):
            p = Path(directory)/'RELEASE_ARTIFACTS.json'
            self.assertIsNone(m.retired_admin_image())
            p.write_text(json.dumps(receipt));self.assertEqual(m.retired_admin_image(), image)
            receipt['retiredComponents']['admin']['image'] = 'sha256:' + 'b'*64
            p.write_text(json.dumps(receipt))
            with self.assertRaises(ValueError):m.retired_admin_image()
            p.unlink();p.symlink_to(Path(directory)/'missing')
            with self.assertRaises(ValueError):m.retired_admin_image()

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
