#!/usr/bin/env python3
"""Failure-only Feishu notices; never include credentials or command output."""
import argparse
import json
import os
from pathlib import Path
import re
import stat
from urllib import request


WEBHOOK = re.compile(r'https://open\.feishu\.cn/open-apis/bot/v2/(?:hook/)?[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}')


def read_webhook(path):
    descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        info = os.fstat(descriptor)
        if not stat.S_ISREG(info.st_mode) or info.st_mode & 0o077 or info.st_uid != os.geteuid():
            raise ValueError('Notification credential must be an owner-only regular file')
        value = os.read(descriptor, 8193).decode().strip()
    finally:
        os.close(descriptor)
    if len(value) > 8192 or not WEBHOOK.fullmatch(value):
        raise ValueError('Invalid Feishu notification credential')
    return value


class NoRedirect(request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('Notification redirects are not allowed')


def send(webhook, *, test=False, kind='deploy'):
    if not WEBHOOK.fullmatch(webhook):
        raise ValueError('Invalid Feishu notification credential')
    if test:
        text = '部署失败告警通道测试：这是一条测试消息，不是线上故障，不影响网站。'
    else:
        action = '回退' if kind == 'rollback' else '发布'
        text = f'部署失败：官网本次{action}未通过。请检查发布记录与当前运行状态；本消息不代表网站已停机，也不代表自动恢复成功。'
    payload = json.dumps({'msg_type': 'text', 'content': {'text': text}}, ensure_ascii=False).encode()
    req = request.Request(webhook, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        opener = request.build_opener(NoRedirect())
        with opener.open(req, timeout=15) as response:
            if response.status != 200:
                raise ValueError('Non-success HTTP response')
            raw = response.read(65537)
            if len(raw) > 65536:
                raise ValueError('Oversized response')
            result = json.loads(raw)
        code = result.get('code', result.get('StatusCode'))
        if type(code) is not int or code != 0:
            raise ValueError('Platform rejected notice')
    except Exception:
        # Never expose the webhook, platform response, or environment in errors.
        raise RuntimeError('Deployment notification was not accepted by the platform') from None
    return {'platformAccepted': True, 'humanReceiptVerified': False, 'test': test}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--webhook-file', type=Path, required=True)
    parser.add_argument('--test', action='store_true', required=True,
                        help='Explicitly send one labelled channel test after authorization')
    args = parser.parse_args()
    print(json.dumps(send(read_webhook(args.webhook_file), test=True)))


if __name__ == '__main__':
    main()
