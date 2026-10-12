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

def main():
 global TOOLS_ROOT,TOOLS_SHA256
 parser=argparse.ArgumentParser()
 parser.add_argument('--input',type=Path,required=True)
 parser.add_argument('--input-sha256',required=True)
 parser.add_argument('--tools-root',type=Path,required=True)
 parser.add_argument('--records-root',type=Path,default=Path('/data/migration-rehearsals'))
 args=parser.parse_args();began=now();stamps=[]
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
 def command(argv):return subprocess.check_output(argv,text=True,stderr=subprocess.DEVNULL,timeout=60)
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
  for component in ['backend','admin']:
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
  archive_checks={}
  for v in frontend:
   expected=Path(v['serverArchivePath'])
   need(expected.is_absolute() and expected.is_relative_to(args.records_root) and expected.name=='frontend.tar.gz' and '..' not in expected.parts,'bound-archive-path-required')
   info,_=storage._verified_file(expected,v['archiveSha256'],size=v['archiveBytes']);stamps.append((expected,signature(info)))
   archive_checks[v['role']]={'path':str(expected),'bytes':info.st_size,'sha256':v['archiveSha256'],'device':info.st_dev,'inode':info.st_ino,'sourceCommit':v['sourceCommit'],'passed':True}
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
