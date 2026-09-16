import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).parent))
import deployment_notice as n
import frontend_release as r

BOT_ID = '00000000-0000-0000-0000-000000000000'
HOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/' + BOT_ID


class NoticeTests(unittest.TestCase):
    def test_private_file_only_and_reject_symlink_or_wrong_host(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'credential'
            path.write_text(HOOK)
            path.chmod(0o600)
            self.assertEqual(n.read_webhook(path), HOOK)
            path.chmod(0o644)
            with self.assertRaises(ValueError): n.read_webhook(path)
            path.chmod(0o600)
            link = Path(tmp) / 'link'
            link.symlink_to(path)
            with self.assertRaises(OSError): n.read_webhook(link)
            path.write_text('https://example.test/open-apis/bot/v2/fixture')
            with self.assertRaises(ValueError): n.read_webhook(path)

    def test_complete_current_and_legacy_addresses_are_accepted(self):
        for prefix in ['https://open.feishu.cn/open-apis/bot/v2/hook/',
                       'https://open.feishu.cn/open-apis/bot/v2/']:
            with tempfile.TemporaryDirectory() as tmp:
                path = Path(tmp) / 'credential'
                path.write_text(prefix + BOT_ID)
                path.chmod(0o600)
                self.assertEqual(n.read_webhook(path), prefix + BOT_ID)

    def test_truncated_addresses_and_extra_components_never_send(self):
        invalid = ['https://open.feishu.cn/open-apis/bot/v2/hook',
                   'https://open.feishu.cn/open-apis/bot/v2/abcd',
                   HOOK + '/extra', HOOK + '?redirect=example.test',
                   HOOK + '#fragment', HOOK.replace('open.feishu.cn', 'open.feishu.cn.example.test')]
        with patch.object(n.request, 'build_opener') as opener:
            for address in invalid:
                with self.assertRaises(ValueError): n.send(address, test=True)
            opener.assert_not_called()

    def response(self, body, status=200):
        response = Mock(status=status)
        response.read.return_value = json.dumps(body).encode()
        context = Mock()
        context.__enter__ = Mock(return_value=response)
        context.__exit__ = Mock(return_value=False)
        opener = Mock()
        opener.open.return_value = context
        return opener

    def test_failure_and_test_messages_match_keyword_without_false_outage(self):
        for test in [False, True]:
            opener = self.response({'code': 0})
            with patch.object(n.request, 'build_opener', return_value=opener):
                receipt = n.send(HOOK, test=test)
            text = json.loads(opener.open.call_args.args[0].data)['content']['text']
            self.assertIn('部署失败', text)
            if test: self.assertIn('不是线上故障', text)
            self.assertTrue(receipt['platformAccepted'])
            self.assertFalse(receipt['humanReceiptVerified'])

    def test_rejection_bad_json_or_http_never_counts_as_sent(self):
        for body, status in [({'code': 19024}, 200), ({'code': False}, 200), ({}, 200), ({'code': 0}, 500)]:
            with patch.object(n.request, 'build_opener', return_value=self.response(body, status)):
                with self.assertRaises(RuntimeError): n.send(HOOK)

    def test_errors_do_not_disclose_webhook(self):
        opener = Mock()
        opener.open.side_effect = RuntimeError(HOOK)
        with patch.object(n.request, 'build_opener', return_value=opener):
            with self.assertRaises(RuntimeError) as error: n.send(HOOK)
        self.assertNotIn(HOOK, str(error.exception))

    def test_redirects_are_refused(self):
        with self.assertRaises(ValueError):
            n.NoRedirect().redirect_request(None, None, 302, '', {}, 'https://example.test')

    def test_success_and_preflight_failure_do_not_send(self):
        release = Mock()
        release.execute.return_value = {'passed': True}
        with patch.object(n, 'send') as send:
            r.execute_with_notice(release, True, 'deploy', HOOK)
            send.assert_not_called()
            release.execute.side_effect = RuntimeError('preflight failed')
            with self.assertRaisesRegex(RuntimeError, 'preflight failed'):
                r.execute_with_notice(release, False, 'deploy', HOOK)
            send.assert_not_called()

    def test_release_failure_survives_notification_failure(self):
        with tempfile.TemporaryDirectory() as tmp:
            release = Mock(audit=Path(tmp))
            release.execute.side_effect = RuntimeError('original release failure')
            with patch.object(n, 'send', side_effect=RuntimeError('bot rejected')):
                with self.assertRaisesRegex(RuntimeError, 'original release failure'):
                    r.execute_with_notice(release, True, 'rollback', HOOK)
            receipt = json.loads((Path(tmp) / 'failure-notification.json').read_text())
            self.assertFalse(receipt['platformAccepted'])


if __name__ == '__main__':
    unittest.main()
