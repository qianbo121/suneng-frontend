#!/usr/bin/env python3
import base64
import gzip
import json
import unittest
from remote_frontend_acceptance import decode, sha, FIXED


def bundle(files):
    value = {'schemaVersion': 1, 'files': {name: {'base64': base64.b64encode(data).decode(), 'sha256': sha(data)} for name, data in files.items()}}
    raw = gzip.compress(json.dumps(value).encode())
    return base64.b64encode(raw).decode(), sha(raw)


class ReceiptBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.files = dict.fromkeys(FIXED, b'{}')
        self.files['entry-config.json'] = json.dumps({'root': '/Users/qianbo/Desktop/Coding/独立站/output/verified-release-archives/frontend-example', 'sourceCommit': 'a'*40}).encode()
        self.files['release-config.json'] = json.dumps({'sourceWorktree': '/Users/qianbo/.codex/worktrees/example/独立站', 'sourceCommit': 'a'*40}).encode()
        self.files['browser/production-identity-before.json'] = b'{"baseUrl":"https://www.jssngyl.cn"}'

    def test_accepts_json_receipts_only(self):
        files, _, _ = decode(*bundle(self.files))
        self.assertEqual(files, self.files)

    def test_refuses_path_traversal(self):
        self.files['../arbitrary.json'] = b'{}'
        with self.assertRaises(ValueError): decode(*bundle(self.files))

    def test_refuses_code(self):
        self.files['entry/apply/operation/program.py'] = b'{}'
        with self.assertRaises(ValueError): decode(*bundle(self.files))

    def test_refuses_wrong_digest(self):
        encoded, _ = bundle(self.files)
        with self.assertRaises(ValueError): decode(encoded, 'b'*64)

    def test_refuses_missing_receipts(self):
        del self.files['plan.json']
        with self.assertRaises(ValueError): decode(*bundle(self.files))

    def test_refuses_other_origin(self):
        self.files['browser/production-identity-before.json'] = b'{"baseUrl":"https://example.com"}'
        with self.assertRaises(ValueError): decode(*bundle(self.files))

    def test_refuses_other_location(self):
        self.files['entry-config.json'] = b'{"root":"/tmp/unsafe","sourceCommit":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}'
        with self.assertRaises(ValueError): decode(*bundle(self.files))

    def test_refuses_mismatched_source(self):
        self.files['release-config.json'] = self.files['release-config.json'].replace(b'a'*40, b'b'*40)
        with self.assertRaises(ValueError): decode(*bundle(self.files))


if __name__ == '__main__': unittest.main()
