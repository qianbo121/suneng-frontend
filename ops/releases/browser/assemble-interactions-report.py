#!/usr/bin/env python3
"""Bind real additional interactions separately from the untouched 20 base views."""
import argparse,datetime,hashlib,json,pathlib,re,struct,urllib.parse
p=argparse.ArgumentParser()
p.add_argument('--phase',choices=['candidate','production'],required=True)
p.add_argument('--plan',required=True)
p.add_argument('--plan-sha256',required=True)
p.add_argument('--identity-before',required=True)
p.add_argument('--identity-after',required=True)
a=p.parse_args()
root=pathlib.Path(__file__).resolve().parent
artifact_root=root.parent
plan_bytes=pathlib.Path(a.plan).read_bytes()
assert hashlib.sha256(plan_bytes).hexdigest()==a.plan_sha256
plan=json.loads(plan_bytes)

def instant(value):
    result=datetime.datetime.fromisoformat(value.replace('Z','+00:00'))
    assert result.tzinfo is not None
    return result

def relative(path):return str(pathlib.Path(path).resolve().relative_to(artifact_root))
bound={}
def bind(path):
    path=pathlib.Path(path).resolve()
    bound[relative(path)]=hashlib.sha256(path.read_bytes()).hexdigest()

before=json.loads(pathlib.Path(a.identity_before).read_text())
after=json.loads(pathlib.Path(a.identity_after).read_text())
start,end=instant(before['checkedAtUtc']),instant(after['checkedAtUtc'])
identity_checks={
    'actualSameContainer':before['container']==after['container'],
    'actualSameOrigin':before['baseUrl']==after['baseUrl'],
    'actualSourceMatches':before['container']['source']==plan['sourceCommit'],
    'actualImageMatches':before['container']['image']==plan['runtimeImage'],
    'actualRunningHealthy':before['container']['running'] is True and before['container']['health']=='healthy',
    'readOnlyIdentities':before['readOnly'] is True and after['readOnly'] is True,
    'orderedIdentityWindow':start<=end,
}
for path,identity in [(a.identity_before,before),(a.identity_after,after)]:
    bind(path)
    raw=artifact_root/identity['rawIdentityFile']
    assert json.loads(raw.read_text())==identity['container']
    bind(raw)
for name in ['capture-interactions.py','assemble-interactions-report.py','acceptance-plan.json','sanitize-evidence.py']:
    bind(root/name)
origin=urllib.parse.urlsplit(before['baseUrl'])
reports=[]
retained_failures=[]
for view in ['pc','mobile']:
    viewport=[1440,900] if view=='pc' else [390,844]
    for task in ['news-search','equipment-links','trolley-resources','contacts']:
        task_root=root/a.phase/plan['sourceCommit'][:12]/'interactive'/view/task
        attempts=sorted(task_root.glob('attempt-*'))
        assert attempts and len(attempts)<=2
        selected=attempts[-1]
        for attempt in attempts:
            previous=json.loads((attempt/'interaction-receipt.json').read_text())
            if previous['passed'] is False:
                retained_failures.append({'viewport':view,'task':task,'receipt':relative(attempt/'interaction-receipt.json')})
            for file in attempt.iterdir():
                if file.is_file():bind(file)
        receipt=json.loads((selected/'interaction-receipt.json').read_text())
        messages=json.loads((selected/'console.raw.json').read_text())['data']['messages']
        errors=json.loads((selected/'errors.raw.json').read_text())['data']['errors']
        actual_console='\n'.join('['+str(m.get('type',m.get('level','unknown')))+'] '+str(m.get('text',m.get('message',json.dumps(m,ensure_ascii=False)))) for m in messages)
        checks={
            'collectorPassed':receipt['passed'] is True,
            'actualSourceBound':receipt['sourceCommit']==plan['sourceCommit'] and receipt['runtimeImage']==plan['runtimeImage'],
            'actualPlanBound':receipt['planSha256']==a.plan_sha256,
            'collectorSourceUnchanged':receipt['collectorSourceSha256']==hashlib.sha256((root/'capture-interactions.py').read_bytes()).hexdigest(),
            'actualViewportBound':receipt['viewport']==viewport,
            'actualTaskBound':receipt['task']==task and receipt['phase']==a.phase,
            'leadFormNotSubmitted':receipt['leadFormSubmitted'] is False and receipt['formSubmitted'] is False,
            'externalContactNotActivated':receipt['externalContactActivated'] is False,
            'consoleActuallyClean':receipt['consoleMessageCount']==len(messages) and re.search(r'hydrat|did not match|\[(error|warn(ing)?)\]',actual_console,re.I) is None,
            'errorsActuallyEmpty':receipt['runtimeErrorCount']==len(errors)==0,
            'receiptInsideIdentityWindow':start<=instant(receipt['atUtc'])<=end,
        }
        for file,value in receipt['boundFilesSha256'].items():
            assert pathlib.Path(file).name==file
            checks['boundFile:'+file]=hashlib.sha256((selected/file).read_bytes()).hexdigest()==value
        expected_arrivals={'news-search':1,'equipment-links':5 if view=='pc' else 1,'trolley-resources':3 if view=='pc' else 1,'contacts':0}[task]
        expected_states={'news-search':3,'equipment-links':10 if view=='pc' else 2,'trolley-resources':6 if view=='pc' else 2,'contacts':4}[task]
        checks['actualStateCount']=len(receipt['states'])==expected_states
        checks['actualNavigationCount']=len(receipt['actualNavigationArrivals'])==expected_arrivals
        if task=='contacts':
            checks['actualContactClicked']=receipt['contactClicked'] is True
            checks['actualContactDialogOpened']=receipt['contactDialogOpened'] is True
        else:
            checks['noContactClicked']=receipt['contactClicked'] is False and receipt['contactDialogOpened'] is False
        for state in receipt['states']:
            data=json.loads((selected/state['record']).read_text())
            url=urllib.parse.urlsplit(data['url'])
            png=(selected/state['screenshot']).read_bytes()
            w,h=struct.unpack('>II',png[16:24])
            key=state['state']
            checks[key+':actualAssertions']=bool(data['assertions']) and all(v is True for v in data['assertions'].values())
            checks[key+':actualViewport']=data['observed']['viewport']=={'width':viewport[0],'height':viewport[1]}
            checks[key+':actualOrigin']=(url.scheme,url.hostname,url.port)==(origin.scheme,origin.hostname,origin.port)
            checks[key+':insideIdentityWindow']=start<=instant(data['at'])<=end
            checks[key+':actualPng']=png[:8]==b'\x89PNG\r\n\x1a\n' and len(png)>1024 and w==viewport[0] and h>=viewport[1]
        reports.append({'task':task,'viewport':view,'receipt':relative(selected/'interaction-receipt.json'),'checks':checks,'passed':all(checks.values()),'actualNavigationCount':len(receipt['actualNavigationArrivals']),'actualStateCount':len(receipt['states'])})
passed=all(identity_checks.values()) and all(r['passed'] for r in reports) and len(reports)==8
result={'method':'real-browser','phase':a.phase,'sourceCommit':plan['sourceCommit'],'runtimeImage':plan['runtimeImage'],'planSha256':a.plan_sha256,'passed':passed,'identityBefore':relative(a.identity_before),'identityAfter':relative(a.identity_after),'identityChecks':identity_checks,'actualTaskCount':len(reports),'actualNavigationCount':sum(r['actualNavigationCount'] for r in reports),'actualStateCount':sum(r['actualStateCount'] for r in reports),'contactDialogOpened':any(r['task']=='contacts' and r['checks'].get('actualContactDialogOpened') for r in reports),'externalContactActivated':False,'formSubmitted':False,'reports':reports,'retainedFailedAttempts':retained_failures,'collectorFiles':['browser/capture-interactions.py','browser/assemble-interactions-report.py'],'boundFilesSha256':bound,'generatedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'limits':['Separate real interaction dataset from 20 read-only base views.','Mobile uses narrow viewport with desktop user agent to exercise phone modal without dialing.','Native external protocol is prevented in contact session only; original page handler executes.','Read-only news GET search is the only submitted search form.','Actual screenshots still need visual review.']}
output=root/(a.phase+'-interaction-report-'+plan['sourceCommit'][:12]+'.json')
with output.open('x') as handle:json.dump(result,handle,ensure_ascii=False,indent=2);handle.write('\n')
print(json.dumps({'report':str(output),'passed':passed,'tasks':len(reports),'actualNavigationCount':result['actualNavigationCount'],'actualStateCount':result['actualStateCount']},ensure_ascii=False))
if not passed:raise SystemExit(1)
