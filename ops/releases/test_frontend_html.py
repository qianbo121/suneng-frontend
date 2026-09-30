import unittest
from unittest.mock import patch
import frontend_html as html

GOOD = {'status': 200, 'contentType': 'text/html; charset=utf-8',
        'cacheControl': 'private, no-store, max-age=0',
        'body': '<script src="/_next/static/chunks/new.js"></script>'}


class HomepageVersionTest(unittest.TestCase):
    def test_public_ordinary_urls_must_match_candidate(self):
        with patch.object(html, 'read_page', return_value=GOOD) as read:
            candidate = html.frontend_html_probe('candidate-container')
            self.assertEqual(html.frontend_html_probe(expected=candidate), candidate)
            self.assertEqual(read.call_args_list[-2].args, ('/zh', None))
            self.assertEqual(read.call_args_list[-1].args, ('/en', None))

    def test_old_200_response_is_not_a_successful_release(self):
        with patch.object(html, 'read_page', return_value=GOOD):
            candidate = html.frontend_html_probe('candidate')
        stale = {**GOOD, 'body': GOOD['body'].replace('new.js', 'old.js')}
        with patch.object(html, 'read_page', return_value=stale), self.assertRaisesRegex(RuntimeError, 'not the checked candidate'):
            html.frontend_html_probe(expected=candidate)

    def test_missing_script_non_html_redirect_and_cached_response_fail(self):
        for change in [{'body': '<h1>Loading</h1>'}, {'status': 307}, {'status': 404},
                       {'contentType': 'application/json'}, {'cacheControl': 'public, max-age=3600'},
                       {'cacheControl': 'private, x-no-store=true'}]:
            with self.subTest(change=change), patch.object(html, 'read_page', return_value={**GOOD, **change}), self.assertRaises(RuntimeError):
                html.frontend_html_probe()

    def test_rollback_allows_old_cache_but_still_compares_version(self):
        old = {**GOOD, 'cacheControl': 'public, max-age=300'}
        with patch.object(html, 'read_page', return_value=old):
            candidate = html.frontend_html_probe('old', require_no_store=False)
            html.frontend_html_probe(expected=candidate, require_no_store=False)
        with patch.object(html, 'read_page', return_value={**old, 'body': GOOD['body'].replace('new.js', 'different.js')}), self.assertRaises(RuntimeError):
            html.frontend_html_probe(expected=candidate, require_no_store=False)

    def test_inline_and_third_party_scripts_do_not_change_build_identity(self):
        parser = html.EntryScripts()
        parser.feed(GOOD['body'] + '<script>window.date="different"</script><script src="https://hm.baidu.com/tag.js"></script>')
        self.assertEqual(parser.assets, {'/_next/static/chunks/new.js'})

    def test_query_parameters_cannot_bypass_cache_check(self):
        with self.assertRaises(ValueError):
            html.read_page('/zh?fresh=1')


if __name__ == '__main__':
    unittest.main()
