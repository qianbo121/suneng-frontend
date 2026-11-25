"""Receive one verified release into a private staging directory. Invoked locally or over SSH."""
import hashlib
import os
from pathlib import Path
import sys
import tempfile


def checked_digest(path):
    if path.resolve() != path or not path.is_file():
        raise ValueError('Transfer must be a regular file without symlink ancestors')
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
        os.fsync(stream.fileno())
    return digest.hexdigest()


def receive(action, destination, basis, expected, scratch):
    directory = Path(destination)
    if not directory.is_absolute() or directory.resolve() != directory or not directory.is_dir():
        raise ValueError('Unsafe staging directory')
    final = directory / 'frontend.tar.gz'
    if action == 'prepare':
        if final.exists() or final.is_symlink():
            if checked_digest(final) != expected:
                raise FileExistsError(final)
            return 'already-verified'
        if basis:
            previous = Path(basis) / final.name
            if previous.resolve() != previous or not previous.is_file() or previous.parent == directory:
                raise ValueError('Invalid rollback basis')
        return tempfile.mkdtemp(prefix='.frontend-transfer-', dir=directory)

    work = Path(scratch)
    if work.parent != directory or not work.name.startswith('.frontend-transfer-') or work.resolve() != work:
        raise ValueError('Invalid temporary transfer directory')
    archive = work / final.name
    if action == 'discard' and not work.exists():
        return ''
    if action not in {'finish', 'discard'} or archive.is_symlink():
        raise ValueError('Invalid transfer action or file')
    if action == 'finish':
        if checked_digest(archive) != expected:
            raise ValueError('Received archive differs from the complete candidate')
        try:
            os.link(archive, final)
        except FileExistsError:
            if checked_digest(final) != expected:
                raise
        fd = os.open(directory, os.O_RDONLY)
        try:
            os.fsync(fd)
        finally:
            os.close(fd)
    archive.unlink(missing_ok=True)
    work.rmdir()
    return ''


if __name__ == '__main__':
    print(receive(*sys.argv[1:]))
