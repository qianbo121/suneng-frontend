#!/usr/bin/env python3
"""Read current/previous recovery materials using externally bound real batch inputs.
No restore, image import, service restart or cleanup is performed. Legacy result
field names are retained for release_contract compatibility; counts are observed.
"""
import argparse, datetime, fcntl, hashlib, importlib.util, json, os, re, stat, sys, subprocess
from pathlib import Path
sys.dont_write_bytecode=True
HASH=re.compile(r'[0-9a-f]{64}')
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def need(value, message):
 if not value: raise ValueError(message)
def signature(s):
 return (s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns,s.st_ctime_ns,s.st_nlink,s.st_mode)
def check_path(p, regular=True):
 p=Path(p)
 need(p.is_absolute() and '..' not in p.parts,'unsafe-path')
 for a in [*reversed(p.parents),p]:
  s=a.lstat(); need(not stat.S_ISLNK(s.st_mode),'symlink-rejected')
  if a!=p: need(stat.S_ISDIR(s.st_mode),'non-directory-parent')
 s=p.lstat()
 if regular: need(stat.S_ISREG(s.st_mode) and s.st_nlink==1,'ordinary-single-link-file-required')
 else: need(stat.S_ISDIR(s.st_mode),'directory-required')
 return p,signature(s)
def full_read(p,expected_sha=None,expected_bytes=None,capture=False):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 p,before=check_path(p)
 if capture: need(before[2]<=4*1024*1024,'small-evidence-bound')
 fd=os.open(p,os.O_RDONLY|getattr(os,'O_NOFOLLOW',0))
 digest,count,data=hashlib.sha256(),0,bytearray()
 try:
  need(signature(os.fstat(fd))==before,'opened-file-identity-mismatch')
  with os.fdopen(fd,'rb',closefd=False) as stream:
   while True:
    block=stream.read(8*1024*1024)
    if not block: break
    digest.update(block);count+=len(block)
    if capture: data.extend(block)
  need(signature(os.fstat(fd))==before,'file-descriptor-changed-during-read')
 finally: os.close(fd)
 need(check_path(p)[1]==before and count==before[2],'file-path-changed-or-short-read')
 hexdigest=digest.hexdigest()
 if expected_sha is not None: need(hexdigest==expected_sha,'complete-sha-mismatch')
 if expected_bytes is not None: need(count==expected_bytes,'complete-size-mismatch')
 return {'path':str(p),'sha256':hexdigest,'sizeBytes':count,'device':before[0],'inode':before[1],'mtimeNs':before[3],'ctimeNs':before[4],'nlink':before[5],'mode':before[6],'readStartedAtUtc':start,'readCompletedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fullReadMatched':True,'regularSingleLink':True,'stableDescriptorAndPathDuringRead':True},bytes(data),before

def deployment_lock(check):
    """Open the existing lock, accepting only Ubuntu's exact /var/lock alias."""
    logical = Path('/var/lock/corp-site-deploy.lock')
    alias = logical.parent
    aliased = alias.is_symlink()
    canonical = Path('/run/lock/corp-site-deploy.lock') if aliased else logical

    def inspect():
        check(not any(p.is_symlink() for p in alias.parents), 'unsafe_lock_parent')
        check(alias.is_symlink() == aliased, 'deployment_lock_alias_changed')
        if aliased:
            check(os.readlink(alias) == '/run/lock', 'unsupported_deployment_lock_alias')
        check(not any(p.is_symlink() for p in (canonical, *canonical.parents)), 'unsafe_lock_path')
        info = canonical.stat()
        check(stat.S_ISREG(info.st_mode) and info.st_nlink == 1, 'regular_single_link_lock_required')
        other = logical.stat()
        check((other.st_dev, other.st_ino) == (info.st_dev, info.st_ino), 'deployment_lock_identity_mismatch')
        return info

    before = inspect()
    fd = os.open(canonical, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        opened = os.fstat(fd)
        check(stat.S_ISREG(opened.st_mode) and opened.st_nlink == 1, 'regular_single_link_lock_required')
        check((opened.st_dev, opened.st_ino) == (before.st_dev, before.st_ino), 'deployment_lock_identity_changed')
        after = inspect()
        check((after.st_dev, after.st_ino) == (before.st_dev, before.st_ino), 'deployment_lock_identity_changed')
        return os.fdopen(fd, 'rb')
    except BaseException:
        os.close(fd)
        raise


def verified_installed_tools():
    need(TOOLS_ROOT.is_dir() and not any(p.is_symlink() for p in (TOOLS_ROOT, *TOOLS_ROOT.parents)),
         'reviewed-installed-tools-directory-required')
    for relative, expected in TOOLS_SHA256.items():
        path = TOOLS_ROOT / relative
        need(not any(p.is_symlink() for p in (path, *path.parents)), 'unsafe-installed-tool-path')
        before = path.stat()
        need(stat.S_ISREG(before.st_mode) and before.st_nlink == 1, 'single-link-installed-tool-required')
        raw = path.read_bytes()
        after = path.stat()
        fields = ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns', 'st_nlink')
        need(all(getattr(before, field) == getattr(after, field) for field in fields) and
             hashlib.sha256(raw).hexdigest() == expected, 'installed-tools-changed-or-unreviewed')
    return TOOLS_ROOT

def independent_archive_check(version, local_report, verified_at, algorithm_sha):
    """Validate a real complete-read observation made at the independent archive host."""
    need(local_report.get('kind')=='complete-independent-program-archive-observation' and
         local_report.get('algorithmSha256')==algorithm_sha and
         set(local_report.get('checks',{}))=={'current','previous'},'bound-independent-archive-observation-required')
    proof=local_report['checks'][version['role']]
    need(proof.get('passed') is True and proof.get('completeArchiveAndAllLayerPayloadsVerified') is True and
         proof.get('completeGzipEofVerified') is True and proof.get('serverImported') is False and
         proof.get('productionSwitched') is False,'actual-offline-complete-read-required')
    need(proof.get('sourceCommit')==version['sourceCommit'] and
         proof.get('archiveSha256')==version['archiveSha256'] and
         proof.get('archiveBytes')==version['archiveBytes'] and
         proof.get('scanStats',{}).get('rawArchiveBytesHashed')==version['archiveBytes'],
         'independent-archive-identity-mismatch')
    identity=proof.get('imageIdentity',{})
    roots=version['rootFsDiffIds'];layers=identity.get('layerBlobChecks',[])
    need(bool(roots) and identity.get('ociRuntimeManifestDigest')==version['runtimeImage'] and
         identity.get('configSource')==version['sourceCommit'] and identity.get('rootFsDiffIds')==roots and
         identity.get('rootFsDiffIdsMatched') is True and len(layers)==len(roots) and
         [x.get('rootFsDiffId') for x in layers]==roots and all(x.get('passed') is True for x in layers),
         'independent-archive-all-layers-required')
    observed=datetime.datetime.fromisoformat(proof['checkedAtUtc'].replace('Z','+00:00'))
    switched=datetime.datetime.fromisoformat(verified_at.replace('Z','+00:00'))
    need(observed.tzinfo is not None and switched.tzinfo is not None and observed>=switched,
         'fresh-post-switch-independent-read-required')
    return {'passed':True,'sourceCommit':version['sourceCommit'],'sha256':version['archiveSha256'],
            'bytes':version['archiveBytes'],'archiveReadLocation':'independent-release-host',
            'completeArchiveReadAtUtc':proof['checkedAtUtc'],'serverArchiveRead':False,
            'serverNativeImageStillRequiresVerification':True}


def command_output(argv):
    """Use identical, untrimmed UTF-8 output for collection and verification."""
    return subprocess.check_output(argv, stderr=subprocess.DEVNULL, timeout=60).decode('utf-8')


def prepare_input(config_path, config_sha, tools_root, records_root, output,
                  *, live=Path('/opt/website'), command=command_output):
    """Observe recovery inputs only; never manufacture verification or acceptance."""
    tools_root, records_root, output, live = map(Path, (tools_root, records_root, output, live))
    stamps = []

    def read(path, expected=None):
        record, raw, stamp = full_read(path, expected, capture=True)
        stamps.append((Path(path), stamp))
        return json.loads(raw), record['sha256']

    config, _ = read(config_path, config_sha)
    need(set(config) == {'schemaVersion', 'sourceCommit', 'previousSourceCommit',
                        'currentBatchRoot', 'previousBatchRoot', 'toolsPins'} and
         config['schemaVersion'] == 1, 'exact-preparation-config-required')
    sources = [config['sourceCommit'], config['previousSourceCommit']]
    need(all(isinstance(v, str) and re.fullmatch(r'[0-9a-f]{40}', v) for v in sources)
         and sources[0] != sources[1], 'distinct-current-previous-sources-required')
    check_path(records_root, regular=False)
    check_path(live, regular=False)
    check_path(tools_root, regular=False)
    need(tools_root == Path(__file__).resolve().parent, 'running-installed-tool-directory-required')
    roots = [Path(config[k]) for k in ('currentBatchRoot', 'previousBatchRoot')]
    for root in roots:
        need(root.is_absolute() and root.is_relative_to(records_root), 'batch-outside-records-root')
        check_path(root, regular=False)
    need(roots[0] != roots[1], 'distinct-batch-roots-required')
    need(output.is_absolute() and output.is_relative_to(roots[0]) and '..' not in output.parts,
         'output-inside-current-batch-required')
    check_path(output.parent, regular=False)
    need(not output.exists() and not output.is_symlink(), 'existing-output-preserved')
    pins = config['toolsPins']
    required = {'verify_recovery_materials.py', 'preparation_guard.py', 'phase_runtime.py',
                'release_retention.py', 'storage_policy.py', 'archive_identity.py', 'component_lifecycle.py'}
    need(isinstance(pins, dict) and len(pins) >= 30 and required <= set(pins),
         'complete-bound-tool-set-required')
    for name, digest in pins.items():
        relative = Path(name)
        need(not relative.is_absolute() and '..' not in relative.parts and
             isinstance(digest, str) and HASH.fullmatch(digest), 'safe-tool-pin-required')
        _, _, stamp = full_read(tools_root / relative, digest)
        stamps.append((tools_root / relative, stamp))
    from preparation_guard import snapshot, compare, assert_no_hold, container_identity
    import release_retention as retention

    def all_containers():
        ids = command(['docker', 'ps', '-aq']).split()
        rows = json.loads(command(['docker', 'inspect', *ids])) if ids else []
        need(set(ids) == set(command(['docker', 'ps', '-aq']).split()), 'container-inventory-changed')
        result = {row['Name']: container_identity(row) for row in rows}
        need(len(result) == len(rows), 'duplicate-container-name')
        return result

    with deployment_lock(need) as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        extra = [live / '.env.production.private']
        before = snapshot(live, command, extra)
        assert_no_hold(before)
        need(before['extraFiles'][str(extra[0])] is None, 'private-absence-required')
        containers = all_containers()
        need(all(containers.get(k) == v for k, v in before['containers'].items()),
             'running-and-all-container-snapshot-mismatch')
        current, current_sha = read(live / 'RELEASE_ARTIFACTS.json')
        need(current['deploymentStatus'] == 'verified' and
             current['frontendRelease']['sourceCommit'] == sources[0], 'current-source-mismatch')
        operation_path, previous_path = map(Path, (current['releaseOperationReceipt'], current['previousReceipt']))
        need(all(p.is_relative_to(roots[0]) for p in (operation_path, previous_path)),
             'current-batch-receipt-path-required')
        operation, operation_sha = read(operation_path)
        previous, previous_sha = read(previous_path)
        need(previous['frontendRelease']['sourceCommit'] == sources[1], 'previous-source-mismatch')
        plan_path = Path(operation['retention']['plan'])
        need(plan_path.is_relative_to(roots[0]), 'current-batch-plan-path-required')
        plan, plan_sha = read(plan_path)
        need(operation['kind'] == 'deploy' and operation['passed'] is True and operation['applied'] is True
             and operation['components'] == plan['components'] == ['frontend'] and
             plan['receiptSha256'] == current_sha and plan['previousReceiptSha256'] == previous_sha and
             plan['operationReceipt'] == str(operation_path) and plan['previousReceipt'] == str(previous_path),
             'actual-frontend-release-chain-required')
        formal = {role: {'path': str(path), 'sha256': digest} for role, path, digest in (
            ('current', live / 'RELEASE_ARTIFACTS.json', current_sha),
            ('previous', previous_path, previous_sha), ('operation', operation_path, operation_sha),
            ('retentionPlan', plan_path, plan_sha))}
        images = sorted(retention.boundaries(current))
        need(len(images) == 6, 'six-recovery-boundaries-required')
        observed = {v['Id']: v for v in json.loads(command(['docker', 'image', 'inspect', *images]))}
        need(set(observed) == set(images), 'all-protected-images-required')
        history = {}
        for component in ('backend', 'admin'):
            history[component] = {}
            for role, key in (('current', 'image'), ('previous', 'expectedCurrentImage')):
                image = current[component + 'Release'][key]
                row = observed[image]
                history[component][role] = {'image': image,
                    'sourceCommit': row['Config']['Labels']['org.opencontainers.image.revision'],
                    'rootFsDiffIds': row['RootFS']['Layers']}
        versions = []
        for role, root, source in zip(('current', 'previous'), roots, sources):
            candidate, _ = read(root / 'artifacts/frontend/candidate.json')
            need(candidate['sourceCommit'] == source, 'candidate-source-mismatch')
            archive = root / 'artifacts/frontend/frontend.tar.gz'
            _, stamp = check_path(archive)
            need(stamp[2] == candidate['archiveBytes'], 'archive-size-mismatch')
            stamps.append((archive, stamp))
            image = current['frontendRelease']['image' if role == 'current' else 'expectedCurrentImage']
            versions.append({'role': role, 'sourceCommit': source, 'runtimeImage': image,
                'rootFsDiffIds': candidate['rootFsDiffIds'], 'archiveSha256': candidate['archiveSha256'],
                'archiveBytes': candidate['archiveBytes'], 'serverArchivePath': str(archive)})
        report_path = roots[0] / 'browser/production-browser-report.json'
        report, report_sha = read(report_path)
        need(report['sourceCommit'] == sources[0] and report['passed'] is True and
             report['phase'] == 'production', 'actual-production-browser-report-required')
        files = []
        for name in ('verified-images.override.yml', 'DEPLOY_COMMIT', '.env.production',
                     'docker-compose.prod.yml', 'nginx.prod.conf.template'):
            path = live / name
            record, _, stamp = full_read(path)
            stamps.append((path, stamp))
            files.append({'path': str(path), 'sha256': record['sha256']})
        value = {'schemaVersion': 1, 'kind': 'actual-post-apply-recovery-check-input',
            'actualPostApplyOriginals': True, 'preparedAtUtc': now(), 'referenceSha256': report_sha,
            'referenceKind': 'actual-current-production-browser-report', 'sourceCommit': sources[0],
            'maintainedToolsSha256': {n: pins[n] for n in
                ('storage_policy.py', 'release_retention.py', 'archive_identity.py')},
            'toolsPins': pins, 'localFormalReportSha256': report_sha,
            'localFormalReportPath': str(report_path), 'futureServerPassed': False,
            'futureReleaseAccepted': False, 'baseline': {'snapshot': before,
                'allContainerIdentities': containers}, 'formalRecords': formal,
            'expectedCurrentImages': current['images'],
            'sixNativeProtectedImages': [{'image': image} for image in images],
            'protectedConfigurationFiles': files, 'frontendVersions': versions,
            'historicalFourImagesExpected': history}
        compare(before, snapshot(live, command, extra))
        need(all_containers() == containers, 'all-container-state-changed')
        for path, stamp in stamps:
            need(check_path(path)[1] == stamp, 'input-or-tool-changed-during-collection')
        # O_EXCL preserves every earlier observation, including failed attempts.
        fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            json.dump(value, stream, ensure_ascii=False, indent=2)
            stream.write('\n')
        return {'prepared': True, 'sourceCommit': sources[0], 'path': str(output),
                'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
                'recoveryVerified': False, 'releaseAccepted': False, 'productionChanged': False}


def main():
 global TOOLS_ROOT,TOOLS_SHA256
 parser=argparse.ArgumentParser()
 parser.add_argument('--input',type=Path,required=True)
 parser.add_argument('--input-sha256',required=True)
 parser.add_argument('--tools-root',type=Path,required=True)
 parser.add_argument('--records-root',type=Path,default=Path('/data/migration-rehearsals'))
 parser.add_argument('--prepare',action='store_true',help='Collect fresh inputs; verification remains a separate invocation')
 parser.add_argument('--output',type=Path)
 args=parser.parse_args();began=now();stamps=[]
 if args.prepare:
  need(args.output is not None, 'new-output-required')
  need(args.records_root==Path('/data/migration-rehearsals'), 'actual-records-root-required')
  print(json.dumps(prepare_input(args.input,args.input_sha256,args.tools_root,args.records_root,args.output)))
  return
 need(args.output is None, 'output-only-with-prepare')
 rec,raw,stamp=full_read(args.input,args.input_sha256,capture=True);stamps.append((args.input,stamp));input_record=rec;config=json.loads(raw)
 source_versions=config['frontendVersions']
 need([v['role'] for v in source_versions]==['current','previous'],'two-ordered-frontend-versions-required')
 EXPECTED_SOURCES=[v['sourceCommit'] for v in source_versions]
 need(all(re.fullmatch(r'[0-9a-f]{40}',s) for s in EXPECTED_SOURCES),'full-source-identities-required')
 TOOL_PINS={name:config['maintainedToolsSha256'][name] for name in ('storage_policy.py','release_retention.py')}
 need(all(HASH.fullmatch(h) for h in TOOL_PINS.values()),'bound-maintained-tools-required')
 need(HASH.fullmatch(args.input_sha256),'external-input-sha-required')
 check_path(args.tools_root,regular=False);check_path(args.records_root,regular=False)
 need(args.records_root==Path('/data/migration-rehearsals'),'actual-records-root-required')
 sys.path.insert(0,str(args.tools_root))
 modules={}
 for name,h in TOOL_PINS.items():
  rec,raw,stamp=full_read(args.tools_root/name,h,capture=True);stamps.append((Path(rec['path']),stamp))
  spec=importlib.util.spec_from_file_location('recovery_'+Path(name).stem,args.tools_root/name)
  module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);modules[name]=module
 storage,retention=modules['storage_policy.py'],modules['release_retention.py']

 need(config['schemaVersion']==1 and config['kind']=='actual-post-apply-recovery-check-input' and config['actualPostApplyOriginals'] is True and HASH.fullmatch(config['referenceSha256']) and config['sourceCommit']==EXPECTED_SOURCES[0],'actual-formal-input-contract')
 need(all(config['maintainedToolsSha256'][n]==h for n,h in TOOL_PINS.items()),'maintained-tool-binding')
 need(HASH.fullmatch(config['localFormalReportSha256']),'actual-local-report-binding')
 need(config['futureServerPassed'] is False and config['futureReleaseAccepted'] is False,'unperformed-input-state')
 TOOLS_ROOT=args.tools_root;TOOLS_SHA256=config['toolsPins']
 need(isinstance(TOOLS_SHA256,dict) and len(TOOLS_SHA256)>=30 and all(HASH.fullmatch(h) for h in TOOLS_SHA256.values()),'complete-bound-tool-set-required')
 verified_installed_tools();sys.path.insert(0,str(TOOLS_ROOT))
 from preparation_guard import snapshot,assert_no_hold,compare,container_identity
 command=command_output
 def state():
   expected=config['baseline'];value=snapshot('/opt/website',command,[Path(p) for p in expected['snapshot']['extraFiles']]);assert_no_hold(value);compare(expected['snapshot'],value)
   ids=command(['docker','ps','-aq']).split();rows=json.loads(command(['docker','inspect',*ids])) if ids else []
   need(set(ids)==set(command(['docker','ps','-aq']).split()),'full-container-inventory-changed')
   identities={r['Name']:container_identity(r) for r in rows}
   need(len(identities)==len(rows)==len(expected['allContainerIdentities']) and identities==expected['allContainerIdentities'],'original-sixteen-full-identities-changed')
   need(value['extraFiles']['/opt/website/.env.production.private'] is None,'private-absence-changed')
   for name,row in value['containers'].items():need(identities[name]==row,'full-and-running-snapshot-binding-mismatch')
   return value
 with deployment_lock(need) as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  lock_identity=(os.fstat(lock.fileno()).st_dev,os.fstat(lock.fileno()).st_ino)
  before=state()
  formal={};formal_records=[]
  need(set(config['formalRecords'])=={'current','previous','operation','retentionPlan'},'exact-four-actual-formal-records')
  for key,f in config['formalRecords'].items():
   path=Path(f['path']);need(path==Path('/opt/website/RELEASE_ARTIFACTS.json') if key=='current' else path.is_relative_to(args.records_root),'formal-server-path-boundary')
   info,data=storage._verified_file(path,f['sha256'],capture=True);stamps.append((path,signature(info)));formal[key]=json.loads(data);formal_records.append({'role':key,'path':str(path),'sha256':f['sha256'],'bytes':info.st_size})
  current,previous,operation,plan=(formal[k] for k in ['current','previous','operation','retentionPlan'])
  need(current['deploymentStatus']=='verified' and current['frontendRelease']['sourceCommit']==EXPECTED_SOURCES[0] and previous['frontendRelease']['sourceCommit']==EXPECTED_SOURCES[1],'verified-current-and-previous-source')
  need(current['previousReceipt']==plan['previousReceipt']==config['formalRecords']['previous']['path'] and current['releaseOperationReceipt']==plan['operationReceipt']==config['formalRecords']['operation']['path'],'exact-previous-operation-path-binding')
  need(operation['retention']['plan']==config['formalRecords']['retentionPlan']['path'] and plan['live']=='/opt/website' and plan['receiptSha256']==config['formalRecords']['current']['sha256'] and plan['previousReceiptSha256']==config['formalRecords']['previous']['sha256'],'final-retention-raw-bindings')
  need(operation['kind']=='deploy' and operation['passed'] is True and operation['applied'] is True and operation['image']==current['images']['frontend'] and operation['components']==plan['components']==['frontend'] and plan['acceptanceRequired'] is True,'real-frontend-only-activation')
  need(current['images']==config['expectedCurrentImages'] and current['frontendRelease']['expectedCurrentImage']==previous['images']['frontend'],'current-previous-runtime-boundary')
  for component in retention.active_components(current):
   if component=='frontend':continue
   need(current['images'][component]==previous['images'][component] and current[component+'Release']==previous[component+'Release'],'unselected-components-preserved')
  protected=retention.boundaries(current)
  need(len(protected)==6 and protected=={v['image'] for v in config['sixNativeProtectedImages']} and len(config['sixNativeProtectedImages'])==6,'native-six-recovery-boundaries')
  protected_files=config['protectedConfigurationFiles'];need(isinstance(protected_files,list) and bool(protected_files) and len({x['path'] for x in protected_files})==len(protected_files),'protected-config-pins-required')
  configuration_records=[]
  for f in protected_files:
   path=Path(f['path']);need(path.is_relative_to(Path('/opt/website')),'protected-config-boundary')
   info,_=storage._verified_file(path,f['sha256']);stamps.append((path,signature(info)));configuration_records.append({'path':str(path),'sha256':f['sha256'],'bytes':info.st_size})
  docker=retention.Docker();before_images=docker.images();before_containers=docker.containers()
  history_records={}
  def traced_history(path,root):
   path=Path(path);need(path.is_relative_to(Path(root)),'accepted-history-boundary')
   record,data,stamp=full_read(path,capture=True);stamps.append((path,stamp));history_records[str(path)]={'path':str(path),'sha256':record['sha256'],'bytes':record['sizeBytes']};return data
  retention.read_file=traced_history
  frontend=config['frontendVersions'];need([v['role'] for v in frontend]==['current','previous'] and [v['sourceCommit'] for v in frontend]==EXPECTED_SOURCES,'exact-frontend-version-set')
  archive_checks={};local_report=None
  if any(v.get('serverArchivePath') is None for v in frontend):
   local_path=Path(config['localFormalReportPath'])
   need(local_path.is_absolute() and local_path.is_relative_to(args.records_root) and '..' not in local_path.parts,'bound-local-report-copy-path-required')
   local_read,local_raw,local_stamp=full_read(local_path,config['localFormalReportSha256'],capture=True)
   stamps.append((local_path,local_stamp));local_report=json.loads(local_raw)
  for v in frontend:
   if v.get('serverArchivePath') is None:
    archive_checks[v['role']]=independent_archive_check(v,local_report,current['productionVerifiedAt'],config['maintainedToolsSha256']['archive_identity.py'])
    archive_checks[v['role']]['localReportSha256']=config['localFormalReportSha256']
   else:
    expected=Path(v['serverArchivePath'])
    need(expected.is_absolute() and expected.is_relative_to(args.records_root) and expected.name=='frontend.tar.gz' and '..' not in expected.parts,'bound-archive-path-required')
    info,_=storage._verified_file(expected,v['archiveSha256'],size=v['archiveBytes']);stamps.append((expected,signature(info)))
    archive_checks[v['role']]={'path':str(expected),'bytes':info.st_size,'sha256':v['archiveSha256'],'device':info.st_dev,'inode':info.st_ino,'sourceCommit':v['sourceCommit'],'passed':True,'archiveReadLocation':'production-host','serverArchiveRead':True}
  image_checks={}
  for component in ['frontend','backend','admin']:
   meta=current[component+'Release'];checks={}
   for role,image in [('current',meta['image']),('previous',meta['expectedCurrentImage'])]:
    source=retention.recorded_version(component,image,current,args.records_root)
    need(source is not None and image in before_images,'accepted-history-and-present-image')
    expectation=next(v for v in frontend if v['role']==role) if component=='frontend' else config['historicalFourImagesExpected'][component][role]
    expected_image=expectation['runtimeImage'] if component=='frontend' else expectation['image']
    need(image==expected_image and source==expectation['sourceCommit'],'exact-accepted-image-source')
    observation=before_images[image]
    need(retention.owned_image(observation,component,source) and observation['layers']==expectation['rootFsDiffIds'],'exact-owned-tag-source-ordered-layers')
    checks[role]={'image':image,'sourceCommit':source,'tag':observation['tags'][0],'rootFsDiffIds':observation['layers'],'passed':True}
   if component not in retention.active_components(current):
    need(not any(r['name']=='/corp-site-'+component and r['running'] for r in before_containers),'retired-component-running')
    checks['retired']=True;image_checks[component]=checks;continue
   running=[r for r in before_containers if r['name']=='/corp-site-'+component]
   need(len(running)==1 and running[0]['image']==meta['image'] and running[0]['running'] is True and running[0]['health']=='healthy','exact-running-component-healthy')
   checks['runningHealthy']=True;image_checks[component]=checks
  need(docker.images()==before_images and docker.containers()==before_containers,'image-or-container-metadata-drift')
  for path,record_stamp in stamps:need(check_path(path)[1]==record_stamp,'evidence-archive-or-config-drift')
  compare(before,state());verified_installed_tools()
  after_lock=Path('/var/lock/corp-site-deploy.lock').stat();need((after_lock.st_dev,after_lock.st_ino)==lock_identity,'shared-lock-identity-drift')
  report={'schemaVersion':1,'kind':'fresh-read-only-server-recovery-material-observation','readOnly':True,'startedAtUtc':began,'finishedAtUtc':now(),'passed':True,'archiveChecks':archive_checks,'imageChecks':image_checks,'productionReceiptSha256':config['formalRecords']['current']['sha256'],'previousReceiptSha256':config['formalRecords']['previous']['sha256'],'operationReceiptSha256':config['formalRecords']['operation']['sha256'],'retentionPlanSha256':config['formalRecords']['retentionPlan']['sha256'],'formalRecords':formal_records,'acceptedHistoryReads':list(history_records.values()),'protectedConfigurationFileReads':configuration_records,'containerMetadataUnchangedDuringCheck':True,'containerCount':len(before_containers),'allContainerConfigurationAcceptedByThisHelper':True,'allSixteenServicesAndConfigurationsUnchanged':True,'originalThirtyToolPinsUnchanged':True,'actualVerifiedToolCount':len(TOOLS_SHA256),'inputRead':input_record,'localFormalReportSha256':config['localFormalReportSha256'],'toolPins':TOOL_PINS,'scriptSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'restorePerformed':False,'customerDataRead':False,'productionBrowserAccepted':False,'releaseAccepted':False,'cleanupPerformed':False}
  print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':
 try:main()
 except Exception as exc:
  print(json.dumps({'passed':False,'code':'safe_server_recovery_check_failed','errorType':type(exc).__name__,'restorePerformed':False,'releaseAccepted':False}));sys.exit(1)
