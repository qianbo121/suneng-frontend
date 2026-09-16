import copy
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import data_backup as d

ID = '20260916T030000Z-1234abcd'
GOOD = {'id': ID, 'kind': 'data-only', 'status': 'backup_complete', 'artifacts': [{'name': 'database.dump'}, {'name': 'uploads.tar.gz'}]}

class DataBackupSafety(unittest.TestCase):
    def test_accepts_only_matching_complete_data_backup(self):
        d.validate_data_manifest(GOOD, ID)
        for key, value in [('id', '20260916T030001Z-1234abcd'), ('status', 'incomplete'), ('kind', 'all-data')]:
            invalid = copy.deepcopy(GOOD)
            invalid[key] = value
            with self.assertRaises(ValueError): d.validate_data_manifest(invalid, ID)

    def test_rejects_extra_missing_and_path_traversal_archives(self):
        for names in [['database.dump'], ['database.dump', '../uploads.tar.gz'], ['database.dump', 'uploads.tar.gz', '.env.production']]:
            invalid = dict(GOOD, artifacts=[{'name': name} for name in names])
            with self.assertRaises(ValueError): d.validate_data_manifest(invalid, ID)

    def test_drill_has_no_network_no_ports_no_production_mount(self):
        with tempfile.TemporaryDirectory() as root, patch.object(d.b, 'PARENT', Path(root)):
            args = d.b.drill_container_args('sha256:' + 'a'*64, ID, Path(root)/ID/'data-restore-drill'/'postgres')
            self.assertEqual(args[args.index('--network')+1], 'none')
            self.assertNotIn('-p', args)
            self.assertNotIn('--publish', args)
            self.assertIn('type=bind,src='+root+'/'+ID+'/data-restore-drill/postgres,dst=/var/lib/postgresql/data', args)
            with self.assertRaises(ValueError): d.b.drill_container_args('image', ID, Path('/data/postgres'))

    def test_low_capacity_stops_before_creating_backup(self):
        with patch.object(d.shutil, 'disk_usage') as usage, patch.object(d.b.Path, 'mkdir') as mkdir:
            usage.return_value.free = 0
            with self.assertRaises(RuntimeError): d.capture(ID)
            mkdir.assert_not_called()

if __name__ == '__main__': unittest.main()
