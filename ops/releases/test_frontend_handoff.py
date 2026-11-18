import tempfile
from pathlib import Path
import unittest
from unittest.mock import patch, Mock

from frontend_handoff import Handoff, HandoffRestored, redirect_frontend


CONFIG = b'http { upstream frontend_upstream { server frontend:3000; } server { return 404; } }\n'


class SimulatedHandoff(Handoff):
    """Stateful failure model. Real proxy/process continuity is tested separately."""
    def __init__(self, root, fault=None):
        super().__init__(root, root, ['compose'], {'DEPLOY_COMMIT':'new'}, self.command,
                         self.health, self.check)
        self.events = []; self.fault = fault; self.serving = 'canonical'; self.canonical = 'old'

    def prepare(self):
        self.events.append('prepare'); self.created = True; self.copy_id = 'owned'
        self.original_template = self.original_active = CONFIG
        self.bridge_template = self.bridge_active = redirect_frontend(CONFIG, self.name)
        self.previous_compose = ['restore']; self.previous_env = {'DEPLOY_COMMIT':'old'}
        if self.fault == 'copy': raise RuntimeError('copy not ready')

    def command(self, args, **kwargs):
        self.events.append(args[0])
        # No current service may be stopped while any request still routes there.
        if self.serving != 'copy': raise AssertionError('stopped a serving canonical')
        self.canonical = 'old' if args[0] == 'restore' else 'new'

    def replacement_headroom(self):
        if self.fault == 'memory-after-start': raise RuntimeError('memory consumed by candidate')

    def activate(self, template, active, label):
        self.touched = True; self.events.append(label)
        self.serving = 'copy' if active == self.bridge_active else 'canonical'
        if label == 'copy-serving' and self.fault == 'drain':
            raise RuntimeError('old worker still serving')
        if label == 'canonical-serving' and self.fault == 'late':
            raise RuntimeError('late verification failure after reload')
        if label == 'copy-serving-recovery' and self.fault == 'recovery':
            raise RuntimeError('cannot confirm recovery drain')

    def health(self, container):
        self.events.append('health-' + self.canonical)
        if self.canonical == 'new' and self.fault in ('health', 'recovery'):
            raise RuntimeError('new service unhealthy')

    def check(self, container, previous):
        self.events.append('verify-' + self.canonical)
        if not previous and self.fault == 'content': raise RuntimeError('wrong page')

    def note(self, stage): self.events.append(stage)

    def remove_copy(self):
        if self.serving != 'canonical': raise AssertionError('removed serving copy')
        self.created = False; self.events.append('remove')


class HandoffTests(unittest.TestCase):
    def test_success_keeps_copy_until_named_service_ready_and_old_workers_drained(self):
        with tempfile.TemporaryDirectory() as tmp:
            h = SimulatedHandoff(Path(tmp)); h.replace()
            self.assertEqual(h.events, ['prepare','copy-serving','compose','health-new','verify-new',
                                       'new-frontend-ready','canonical-serving','remove'])
            self.assertEqual((h.canonical, h.serving, h.created), ('new','canonical',False))

    def test_unhealthy_copy_never_stops_current_service(self):
        with tempfile.TemporaryDirectory() as tmp:
            h = SimulatedHandoff(Path(tmp), 'copy')
            with self.assertRaises(HandoffRestored): h.replace()
            self.assertNotIn('compose', h.events)
            self.assertEqual((h.canonical, h.created), ('old',False))

    def test_memory_consumed_by_candidate_stops_before_routing_or_replacement(self):
        with tempfile.TemporaryDirectory() as tmp:
            h = SimulatedHandoff(Path(tmp), 'memory-after-start')
            with self.assertRaises(HandoffRestored):h.replace()
            self.assertNotIn('compose', h.events);self.assertNotIn('copy-serving', h.events)
            self.assertEqual((h.canonical, h.created), ('old',False))

    def test_undrained_old_workers_prevent_canonical_replacement(self):
        with tempfile.TemporaryDirectory() as tmp:
            h = SimulatedHandoff(Path(tmp), 'drain')
            with self.assertRaises(HandoffRestored): h.replace()
            self.assertNotIn('compose', h.events)
            self.assertEqual((h.canonical, h.serving, h.created), ('old','canonical',False))

    def test_failed_candidate_restores_previous_service_through_copy(self):
        for fault in ('health','content','late'):
            with self.subTest(fault=fault), tempfile.TemporaryDirectory() as tmp:
                h = SimulatedHandoff(Path(tmp), fault)
                with self.assertRaises(HandoffRestored): h.replace()
                self.assertLess(h.events.index('copy-serving-recovery'), h.events.index('restore'))
                self.assertLess(h.events.index('verify-old'), h.events.index('previous-restored'))
                self.assertEqual((h.canonical, h.serving, h.created), ('old','canonical',False))

    def test_failed_recovery_keeps_serving_copy_and_never_forces_cleanup(self):
        with tempfile.TemporaryDirectory() as tmp:
            h = SimulatedHandoff(Path(tmp), 'recovery')
            with self.assertRaisesRegex(RuntimeError, 'recovery drain'): h.replace()
            self.assertNotIn('remove', h.events); self.assertNotIn('restore', h.events)
            self.assertTrue(h.created)

    def test_only_expected_frontend_upstream_changes(self):
        config = Path(__file__).resolve().parents[2].joinpath('nginx.prod.conf.template').read_bytes()
        changed = redirect_frontend(config, 'suneng-frontend-handoff-example')
        self.assertEqual(changed.replace(b'server suneng-frontend-handoff-example:3000;', b'server frontend:3000;'), config)
        self.assertEqual(changed.count(b'suneng-frontend-handoff-example:3000'), 1)

    def test_unknown_upstream_or_hostname_is_rejected(self):
        for config, host in [(CONFIG + CONFIG,'safe'), (CONFIG.replace(b'frontend:3000',b'other:3000'),'safe'),
                             (CONFIG,'bad;server'), (CONFIG,'/foreign'), (CONFIG,'a'*64)]:
            with self.subTest(host=host), self.assertRaises(RuntimeError): redirect_frontend(config, host)

    def test_worker_drain_waits_for_new_generation_and_all_old_workers(self):
        h = Handoff('/unused','/unused',[],{},Mock(),Mock(),Mock(),drain_seconds=1)
        with patch.object(h,'workers',side_effect=[{'11','12','13'}, {'12','13'}, {'13'}]) as workers, patch('frontend_handoff.time.sleep'):
            h.drain({'11','12'}, require_new=True)
            self.assertEqual(workers.call_count, 3)

    def test_worker_timeout_does_not_kill_or_reload_proxy(self):
        command = Mock(); h = Handoff('/unused','/unused',[],{},command,Mock(),Mock(),drain_seconds=1)
        with patch.object(h,'workers',return_value={'11','12'}), patch('frontend_handoff.time.monotonic',side_effect=[0,0,2]), patch('frontend_handoff.time.sleep'):
            with self.assertRaisesRegex(RuntimeError,'did not drain'): h.drain({'11','12'}, require_new=True)
        command.assert_not_called()

    def test_workers_ignore_master_and_control_commands(self):
        command = Mock(return_value='PID COMMAND\n1 nginx: master process nginx\n12 nginx: worker process\n13 nginx: worker process is shutting down\n14 ps -o pid,args\n')
        h = Handoff('/unused','/unused',[],{},command,Mock(),Mock())
        self.assertEqual(h.workers(), {'12','13'})

    def test_template_write_keeps_bind_mount_inode(self):
        with tempfile.TemporaryDirectory() as tmp:
            h = Handoff(tmp,tmp,[],{},Mock(),Mock(),Mock())
            h.template.write_bytes(CONFIG); inode = h.template.stat().st_ino
            h.write_template(b'changed\n')
            self.assertEqual(h.template.stat().st_ino, inode)
            self.assertEqual(h.template.read_bytes(), b'changed\n')

    def test_insufficient_memory_refuses_before_starting_a_copy(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve(); command = Mock()
            h = Handoff(root,root,[],{},command,Mock(),Mock(),target_image='sha256:'+'a'*64); h.template.write_bytes(CONFIG)
            frontend = {'Id':'old','Image':'immutable','State':{'Running':True,'Health':{'Status':'healthy'}},
                        'HostConfig':{'Memory':768*1024**2}}
            proxy = {'Id':'proxy','Mounts':[{'Destination':'/etc/nginx/nginx.conf.template','Source':str(h.template),'RW':False}]}
            with patch.object(h,'inspect',side_effect=[frontend,proxy]), patch.object(h,'read_active',return_value=CONFIG), \
                 patch('frontend_handoff.Path.read_text',return_value='MemAvailable: 1000 kB\n'):
                with self.assertRaisesRegex(RuntimeError,'Insufficient memory'):h.prepare()
            command.assert_not_called(); self.assertEqual(h.template.read_bytes(),CONFIG)

    def test_foreign_proxy_edit_stops_before_writing_or_reloading(self):
        with tempfile.TemporaryDirectory() as tmp:
            command=Mock();h=Handoff(tmp,tmp,[],{},command,Mock(),Mock());h.template.write_bytes(CONFIG)
            h.proxy_id='proxy';h.expected_active=h.expected_template=CONFIG
            with patch.object(h,'inspect',return_value={'Id':'proxy','State':{'Running':True}}), \
                 patch.object(h,'read_active',return_value=b'foreign config'):
                with self.assertRaisesRegex(RuntimeError,'outside'):h.activate(CONFIG,CONFIG,'candidate')
            command.assert_not_called();self.assertEqual(h.template.read_bytes(),CONFIG)

    def test_invalid_proxy_candidate_does_not_touch_active_template(self):
        with tempfile.TemporaryDirectory() as tmp:
            def command(args):
                if '-t' in args:raise RuntimeError('invalid configuration')
                return ''
            h=Handoff(tmp,tmp,[],{},Mock(side_effect=command),Mock(),Mock());h.template.write_bytes(CONFIG)
            h.directory.mkdir();h.proxy_id='proxy';h.expected_active=h.expected_template=CONFIG
            with patch.object(h,'inspect',return_value={'Id':'proxy','State':{'Running':True}}), \
                 patch.object(h,'read_active',return_value=CONFIG),patch.object(h,'workers',return_value={'1'}):
                with self.assertRaisesRegex(RuntimeError,'invalid configuration'):h.activate(CONFIG,CONFIG,'candidate')
            self.assertFalse(h.touched);self.assertEqual(h.template.read_bytes(),CONFIG)
            self.assertFalse(any('reload' in c.args[0] for c in h.run.call_args_list))


if __name__ == '__main__': unittest.main()
