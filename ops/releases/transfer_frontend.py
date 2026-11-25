#!/usr/bin/env python3
"""Stage a verified frontend archive using the preceding complete archive as a transfer basis."""
import argparse
from contextlib import nullcontext, suppress
import json
import os
from pathlib import Path
import re
import shlex
import subprocess

import archive_identity
from storage_reservations import staging_reservation

SAFE_REMOTE_PATH = re.compile(r'/[A-Za-z0-9_./-]+')
HOST = re.compile(r'(?:[A-Za-z0-9_][A-Za-z0-9_.-]*@)?[A-Za-z0-9][A-Za-z0-9.-]*')
RECEIVER = Path(__file__).with_name('frontend_transfer_receiver.py')


def transfer_metric(output, label):
    match = re.search('^' + label + r':\s*([\d,]+) bytes', output, re.M)
    return int(match[1].replace(',', '')) if match else None


def stage(archive, candidate, trusted_sha, destination, basis=None, host=None):
    archive = Path(archive).resolve(strict=True)
    if archive.name != 'frontend.tar.gz':
        raise ValueError('Expected frontend.tar.gz')
    raw = Path(candidate).read_bytes()
    value = json.loads(raw)
    if value.get('component', 'frontend') != 'frontend':
        raise ValueError('Only frontend candidates are supported')
    proof = archive_identity.verify_archive(raw, archive, candidate_sha256=trusted_sha)
    digest = value['archiveSha256']
    if host and not HOST.fullmatch(host):
        raise ValueError('Invalid SSH host')
    if host and any(not SAFE_REMOTE_PATH.fullmatch(str(p)) for p in (destination, basis) if p):
        raise ValueError('Unsupported character in remote release path')

    def receiver(action, scratch=''):
        args = [action, str(destination), str(basis or ''), digest, scratch]
        command = ['python3', '-', *args]
        if host:
            command = ['ssh', '-o', 'BatchMode=yes', '--', host, shlex.join(command)]
        return subprocess.check_output(command, text=True, input=RECEIVER.read_text(),
                                       stderr=subprocess.PIPE).strip()

    result = {'sourceCommit': value['sourceCommit'], 'archiveSha256': digest,
              'archiveBytes': archive.stat().st_size, 'verified': proof['passed']}
    scratch = receiver('prepare')
    if scratch == 'already-verified':
        return dict(result, literalBytes=0, reusedBytes=result['archiveBytes'])
    target = f'{host}:{scratch}/' if host else scratch + '/'
    try:
        command = ['rsync', '--checksum', '--no-whole-file', '--stats', '--chmod=F600']
        if basis:
            command.append('--copy-dest=' + str(basis))
        if host:
            command.extend(['-e', 'ssh -o BatchMode=yes'])
            remote_receiver = ['python3', '-B', '/opt/website/ops/releases/storage_reservations.py',
                               str(destination), str(result['archiveBytes'])]
            command.extend(['--rsync-path', shlex.join(remote_receiver)])
        reservation = nullcontext() if host else staging_reservation(Path(destination), result['archiveBytes'])
        with reservation:
            transfer = subprocess.run(command + ['--', str(archive), target],
                                  env={**os.environ, 'LC_ALL': 'C'},
                                  capture_output=True, text=True, check=True)
        receiver('finish', scratch)
    except BaseException:
        with suppress(subprocess.CalledProcessError):
            receiver('discard', scratch)
        raise
    return dict(result, literalBytes=transfer_metric(transfer.stdout, 'Literal data'),
                reusedBytes=transfer_metric(transfer.stdout, 'Matched data'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', required=True, type=Path)
    parser.add_argument('--candidate', required=True, type=Path)
    parser.add_argument('--candidate-sha256', required=True)
    parser.add_argument('--destination', required=True)
    parser.add_argument('--basis')
    parser.add_argument('--host', required=True)
    args = parser.parse_args()
    print(json.dumps(stage(args.archive, args.candidate, args.candidate_sha256,
                           args.destination, args.basis, args.host)))
