import json, os, subprocess, time, shutil
from pathlib import Path

root=Path(__file__).resolve().parents[2]
output=Path(__file__).parent
docker='/Users/qianbo/Applications/Docker.app/Contents/Resources/bin/docker'
base=[docker,'--context','desktop-linux']
name='codex-geo-timeout-test-20261101'
label='codex.geo-timeout-test=20261101'
created=False
receipt={'production_access':False,'name':name,'image':'postgres:16-alpine','results':{}}
for previous in ['isolated-test-results.json', 'isolated-tests.log', 'isolated-environment.json']:
 path=output/previous
 if path.exists():
  backup=output/('first-'+previous)
  assert not backup.exists(), 'Preserve first run; do not overwrite prior evidence'
  shutil.copy2(path,backup)
def run(args, **kwargs):
 return subprocess.run(args,text=True,capture_output=True,**kwargs)
try:
 context=run([docker,'context','inspect','desktop-linux','--format','{{.Endpoints.docker.Host}}'],check=True)
 assert context.stdout.strip()=='unix:///Users/qianbo/.docker/run/docker.sock'
 prior=run(base+['ps','-a','--filter','name=^/'+name+'$','--format','{{.ID}}'],check=True)
 assert not prior.stdout.strip(), 'Refusing to reuse an existing container'
 started=run(base+['run','-d','--rm','--name',name,'--label',label,'--memory','256m','--cpus','1','--pids-limit','128','--tmpfs','/var/lib/postgresql/data:rw','-p','127.0.0.1::5432','-e','POSTGRES_DB=geo_timeout_test','-e','POSTGRES_PASSWORD=local-isolated-test-only','postgres:16-alpine','-c','max_connections=20','-c','jit=off'],check=True)
 created=True;receipt['container_id']=started.stdout.strip()
 for _ in range(30):
  if run(base+['exec',name,'pg_isready','-U','postgres','-d','geo_timeout_test']).returncode==0:break
  time.sleep(0.5)
 else:raise RuntimeError('Disposable database did not become ready')
 endpoint=run(base+['port',name,'5432/tcp'],check=True).stdout.strip()
 assert endpoint.startswith('127.0.0.1:')
 receipt['endpoint']=endpoint
 env=os.environ.copy()
 url='postgresql://postgres:local-isolated-test-only@'+endpoint+'/geo_timeout_test'
 for key in ['DATABASE_URL','LEAD_EVENT_TEST_DATABASE_URL','CONTENT_GROWTH_TEST_DATABASE_URL','GROWTH_ISOLATION_TEST_DATABASE_URL']:env[key]=url
 env.pop('CONTENT_GROWTH_TEST_PGLITE_MODULE',None)
 # Prove the one initial failure is also present in the unchanged base when
 # the pg driver's timestamp parser follows the Mac's local timezone.
 original=Path('/Users/qianbo/Desktop/Coding/独立站/backend')
 baseline=run([str(original/'node_modules/.bin/jest'),'--runInBand','--json','--outputFile='+str(output/'baseline-timezone-results.json'),'--runTestsByPath','src/modules/shuju-service/shuju-content-growth.integration.spec.ts','--testNamePattern=visit trend counts a cross-midnight'],cwd=original,env=env,timeout=60)
 (output/'baseline-timezone.log').write_text(baseline.stdout+'\n'+baseline.stderr)
 receipt['baseline_under_host_timezone_exit_code']=baseline.returncode
 # Production stores timestamps as UTC. The existing pg fixture uses the host
 # parser (unlike its PGlite branch); make the test runtime explicit, not the
 # user's UI timezone and not a change to any query or expected metric.
 env['TZ']='UTC'
 receipt['test_process_timezone']='UTC'
 tests=[
  'src/modules/shuju-service/growth-read-protection.spec.ts',
  'src/modules/shuju-service/growth-write-isolation.integration.spec.ts',
  'src/modules/shuju-service/shuju-growth-read.service.spec.ts',
  'src/modules/shuju-service/shuju-content-growth.integration.spec.ts',
  'src/modules/shuju-service/shuju-traffic-filter.integration.spec.ts',
  'src/modules/lead-event/lead-event-idempotency.integration.spec.ts',
  'src/modules/lead-event/lead-event-contract.spec.ts',
  'src/modules/lead-event/lead-event-evidence.spec.ts',
  'src/modules/lead-event/lead-event-region.spec.ts',
  'src/modules/custom-requirement/custom-requirement.service.spec.ts',
  'src/common/filters/http-exception.filter.spec.ts',
 ]
 result=run([str(root/'backend/node_modules/.bin/jest'),'--runInBand','--json','--outputFile='+str(output/'isolated-test-results.json'),'--runTestsByPath',*tests],cwd=root/'backend',env=env,timeout=150)
 (output/'isolated-tests.log').write_text(result.stdout+'\n'+result.stderr)
 receipt['test_exit_code']=result.returncode
 print(result.stdout[-1000:]);print(result.stderr[-5000:])
finally:
 if created:
  identity=run(base+['inspect',name,'--format','{{index .Config.Labels "codex.geo-timeout-test"}}'],check=True).stdout.strip()
  assert identity=='20261101'
  stopped=run(base+['stop','-t','3',name],check=True)
  remaining=run(base+['ps','-a','--filter','name=^/'+name+'$','--format','{{.ID}}'],check=True).stdout.strip()
  receipt['test_container_removed']=not bool(remaining)
 (output/'isolated-environment.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
if receipt.get('test_exit_code')!=0:raise SystemExit(1)
print(json.dumps(receipt,ensure_ascii=False))
