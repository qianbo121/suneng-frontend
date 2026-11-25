"""Read compatible shared-host reservations, accounting for interrupted releases."""
import json
from pathlib import Path


def process_identity(pid):
    # The process name in parentheses can contain spaces and closing parentheses.
    fields = (Path('/proc') / str(pid) / 'stat').read_text().rsplit(')', 1)[1].split()
    if fields[0] in {"Z", "X"}:
        raise ProcessLookupError(pid)
    return fields[19]


def active(value):
    if type(value) is int and value >= 0:
        return True
    if (not isinstance(value, dict) or type(value.get('bytes')) is not int or value['bytes'] < 0
            or type(value.get('pid')) is not int or value['pid'] < 1
            or not all(isinstance(value.get(k),str) and value[k] for k in ('token','boot','start'))):
        raise ValueError('同盘预留记录不完整')
    if value['boot'] != Path('/proc/sys/kernel/random/boot_id').read_text().strip():
        return False
    try:
        return value['start'] == process_identity(value['pid'])
    except (FileNotFoundError, ProcessLookupError):
        return False


def read(path):
    if not path.exists():
        return {}
    data = json.loads(path.read_bytes())
    if not isinstance(data, dict):
        raise ValueError('同盘预留文件格式错误')
    return data


def total(path, exclude=None):
    result = 0
    for owner, value in read(path).items():
        if active(value) and owner != exclude:
            result += value if type(value) is int else value['bytes']
    return result


from contextlib import contextmanager
import fcntl
import os
import tempfile
import time
import uuid


def update(path, change):
    # All writers to the shared document use the same stable lock. Readers see
    # either complete version. Legacy integer reservations belong to their owners.
    with path.with_suffix('.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        data = read(path)
        change(data)
        with tempfile.NamedTemporaryFile(mode='w', dir=path.parent, delete=False) as stream:
            json.dump(data, stream)
            stream.flush()
            os.fsync(stream.fileno())
            name = stream.name
        os.replace(name, path)
        fd = os.open(path.parent,os.O_RDONLY)
        try:
            os.fsync(fd)
        finally:
            os.close(fd)


@contextmanager
def reserve(path, amount, identity=None, owner='website'):
    if type(amount) is not int or amount <= 0:
        raise ValueError('官网预留用量无效')
    token = uuid.uuid4().hex
    pid = os.getpid()
    boot, start = identity or (Path('/proc/sys/kernel/random/boot_id').read_text().strip(), process_identity(pid))
    record = {'bytes':amount, 'token':token, 'pid':pid, 'boot':boot, 'start':start, 'createdAt':int(time.time())}
    def take(data):
        for key in list(data):
            if key.startswith('website-prep-') and not active(data[key]):
                del data[key]
        old = data.get(owner)
        if old is not None and active(old):
            raise RuntimeError('另一项官网发布预留仍有效，请核对发版进程')
        data[owner] = record
    def release(data):
        current = data.get(owner)
        if isinstance(current,dict) and current.get('token') == token:
            del data[owner]
    update(path,take)
    try:
        yield
    finally:
        update(path,release)

def staging_reservation(directory, size, home=Path('/opt/shuju')):
    from contextlib import nullcontext
    if not home.is_dir() or directory.stat().st_dev != (home / 'shared').stat().st_dev:
        return nullcontext()
    return reserve(home / 'shared/other-system-reservations.json', size,
                   owner='website-prep-' + uuid.uuid4().hex)


def run_receiver(arguments):
    import subprocess
    if len(arguments) < 3 or arguments[2] != '--server':
        raise ValueError('Expected rsync receiving process')
    directory = Path(arguments[0])
    with staging_reservation(directory, int(arguments[1])):
        return subprocess.call(['rsync', *arguments[2:]])


if __name__ == '__main__':
    import sys
    sys.exit(run_receiver(sys.argv[1:]))
