#!/usr/bin/env python3
"""Real interactive checks in a session distinct from the 20 read-only base cases."""
import argparse
import datetime
import hashlib
import json
import pathlib
import re
import subprocess
import urllib.parse
import importlib.util
_SANITIZER_PATH = pathlib.Path(__file__).resolve().parent / 'sanitize-evidence.py'
_SANITIZER_SPEC = importlib.util.spec_from_file_location('sanitize_evidence', _SANITIZER_PATH)
_SANITIZER = importlib.util.module_from_spec(_SANITIZER_SPEC)
_SANITIZER_SPEC.loader.exec_module(_SANITIZER)

def expected_headings_for(frozen):
    headings = {article['path']:article['title'] for article in frozen['articles']}
    headings.update({
        '/en/news':'Industrial Furnace Selection & Purchasing Resources',
        '/en/products/detail/trolley-furnace':'Bogie-hearth Furnace | Batch Heat Treatment of Large Heavy Parts',
        '/zh/products/detail/fastener-quench-temper-line':'紧固件调质生产线',
        '/zh/products/detail/mesh-belt-furnace':'网带炉｜小型工件连续热处理',
        '/zh/products/detail/trolley-furnace':'台车炉｜大型重型工件周期式热处理',
        '/zh/products/detail/pit-furnace':'井式炉｜长轴类工件立式热处理',
        '/zh/products/detail/roller-hearth-furnace':'辊底炉｜规整工件辊道连续热处理',
    })
    overrides = frozen.get('headingOverrides', {})
    if not isinstance(overrides, dict) or not set(overrides) <= set(headings):
        raise ValueError('Heading overrides must name existing acceptance routes')
    if any(not isinstance(title, str) or not title.strip() or title != title.strip()
           for title in overrides.values()):
        raise ValueError('Heading overrides require nonempty frozen titles')
    headings.update(overrides)
    return headings

parser = argparse.ArgumentParser()
parser.add_argument('--phase', choices=['candidate', 'production'], required=True)
parser.add_argument('--plan', required=True)
parser.add_argument('--plan-sha256', required=True)
parser.add_argument('--identity-before', required=True)
parser.add_argument('--viewport', choices=['pc', 'mobile'], required=True)
parser.add_argument('--task', choices=['news-search', 'equipment-links', 'trolley-resources', 'contacts'], required=True)
parser.add_argument('--attempt', type=int, choices=[1,2], default=1)
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parent
plan_bytes = pathlib.Path(args.plan).read_bytes()
assert hashlib.sha256(plan_bytes).hexdigest() == args.plan_sha256
plan = json.loads(plan_bytes)
identity = json.loads(pathlib.Path(args.identity_before).read_text())
assert identity['readOnly'] is True
assert identity['container']['source'] == plan['sourceCommit']
assert identity['container']['image'] == plan['runtimeImage']
assert identity['container']['running'] is True and identity['container']['health'] == 'healthy'
base = identity['baseUrl']
origin = urllib.parse.urlsplit(base)
assert (origin.hostname=='127.0.0.1' and origin.scheme=='http') if args.phase=='candidate' else base=='https://www.jssngyl.cn'
assert re.fullmatch(r'[A-Za-z0-9_-]{1,80}', plan['qaMarker'])
frozen_bytes = (root/'acceptance-plan.json').read_bytes()
frozen = json.loads(frozen_bytes)
expected_headings = expected_headings_for(frozen)
case_dir = root/args.phase/plan['sourceCommit'][:12]/'interactive'/args.viewport/args.task
if args.attempt==2:
    assert json.loads((case_dir/'attempt-1'/'interaction-receipt.json').read_text())['passed'] is False
out = case_dir/('attempt-'+str(args.attempt))
out.mkdir(parents=True,exist_ok=False)
session = 'release-'+args.phase+'-interactive-'+args.viewport+'-'+plan['sourceCommit'][:12]
viewport = [1440,900] if args.viewport=='pc' else [390,844]
commands, states, navigations = [], [], []
contact_opened = False
contact_clicked = False
search_form_submitted = False

def run(command, name, stdin=None):
    command=['agent-browser','--json','--session',session]+command
    value=subprocess.run(command,input=stdin,text=True,capture_output=True,timeout=45)
    (out/(name+'.raw.json')).write_text(_SANITIZER.safe_output(value.stdout, value.stderr))
    commands.append({'command':command,'exitCode':value.returncode,'file':name+'.raw.json'})
    if value.returncode:
        raise RuntimeError(name+' exit '+str(value.returncode))
    data=_SANITIZER.sanitize(json.loads(value.stdout))
    if data.get('success') is not True:
        raise RuntimeError(name+' did not succeed')
    return data['data']

def evaluate(js,name):
    result=run(['eval','--stdin'],name,stdin=js)['result']
    return json.loads(result) if isinstance(result,str) else result


def ready(path,name,heading=None):
    condition='location.pathname==='+json.dumps(path)
    condition+=" && !!document.querySelector('main h1,h1') && document.querySelector('main h1,h1').innerText.trim().length>0 && !!document.querySelector('main') && document.querySelector('main').innerText.trim().length>200"
    expected_heading = heading or expected_headings.get(path)
    if expected_heading:
        condition += " && document.querySelector('main h1,h1').innerText.replace(/\\s+/g,' ').trim()===" + json.dumps(expected_heading,ensure_ascii=False)
    if re.match(r'^/(en|zh)/news/[^/]+$',path):
        condition += ' && document.querySelector("[data-news-slug]")?.getAttribute("data-news-slug")===' + json.dumps(path.rsplit('/',1)[1])
    if args.phase == 'production':
        condition += " && !!sessionStorage.getItem('suneng_session_id') && sessionStorage.getItem('suneng_session_id') === sessionStorage.getItem('suneng_manual_qa_session_v1')"
    run(['wait','--fn',condition],name)

def open_page(path,name):
    marker=urllib.parse.urlencode({'acquisition_qa':plan['qaMarker']})
    separator='&' if '?' in path else '?'
    run(['open',base+path+separator+marker],name+'-open')
    ready(urllib.parse.urlsplit(path).path,name+'-ready')
    run(['snapshot','-i','-u'],name+'-snapshot')

def capture(name,custom):
    js="""(() => {
      const norm=s=>String(s||'').replace(/\\s+/g,' ').trim();
      const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();const s=getComputedStyle(e);return {x:r.x,y:r.y,width:r.width,height:r.height,display:s.display,visibility:s.visibility};};
      const shown=e=>{const r=rect(e);return !!r&&r.width>0&&r.height>0&&r.display!=='none'&&r.visibility!=='hidden';};
      const pathOf=e=>{const u=new URL(e.href,location.href);return u.origin===location.origin?u.pathname:'';};
      const h=document.querySelector('main h1,h1');
      const sessionId=sessionStorage.getItem('suneng_session_id');
      const qa=sessionStorage.getItem('suneng_manual_qa_session_v1');
      const localPreviewTrackingSuppressed=location.hostname==='127.0.0.1'&&sessionId===null&&qa===null;
      const assertions={headingRendered:shown(h),noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1};
      if (PHASE==='production') assertions.qaSessionMatches=!!sessionId&&!!qa&&sessionId===qa;
      else if (TASK==='contacts') {
        const tokens=new URLSearchParams(location.search).getAll('acquisition_qa');
        assertions.candidateContactQaSessionMatches=location.hostname==='127.0.0.1'&&!!sessionId&&!!qa&&sessionId===qa&&tokens.length===1&&tokens[0]===QA_MARKER;
      } else assertions.localPreviewTrackingSuppressed=localPreviewTrackingSuppressed;
      const observed={heading:norm(h?.innerText),headingRect:rect(h),documentWidth:document.documentElement.scrollWidth,
        qaAssociation:{hostname:location.hostname,sessionId,qa,localPreviewTrackingSuppressed,manualQaQuery:new URLSearchParams(location.search).getAll('acquisition_qa')},viewport:{width:innerWidth,height:innerHeight}};
      CUSTOM
      return {method:'real-browser',url:location.href,at:new Date().toISOString(),assertions,observed};
    })()""".replace('CUSTOM',custom).replace('PHASE',json.dumps(args.phase)).replace('TASK',json.dumps(args.task)).replace('QA_MARKER',json.dumps(plan['qaMarker']))
    data=evaluate(js,name+'-observed')
    run(['snapshot','-i','-u'],name+'-snapshot')
    run(['screenshot',str(out/(name+'.png'))],name+'-screenshot')
    (out/(name+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    states.append({'state':name,'record':name+'.json','screenshot':name+'.png','assertions':data['assertions']})
    if not all(data['assertions'].values()):
        raise RuntimeError(name+' assertions failed')
    return data

def arrival(path,name,heading=None):
    expected_heading = heading or expected_headings.get(path)
    ready(path,name+'-ready',expected_heading)
    assertion='assertions.targetPathMatches=location.pathname==='+json.dumps(path)+"; assertions.notErrorPage=!/404|not found|页面不存在/i.test(norm(h?.innerText)+' '+document.title);"
    if expected_heading:
        assertion+='assertions.targetHeadingMatches=norm(h?.innerText)==='+json.dumps(expected_heading,ensure_ascii=False)+';'
    if re.match(r'^/(en|zh)/news/[^/]+$',path):
        assertion+='assertions.targetNewsSlugMatches=document.querySelector("[data-news-slug]")?.getAttribute("data-news-slug")==='+json.dumps(path.rsplit('/',1)[1])+';'
    data=capture(name,assertion)
    navigations.append({'targetPath':path,'actualUrl':data['url'],'actualH1':data['observed']['heading'],'state':name})

failure=None
try:
    run(['set','viewport',str(viewport[0]),str(viewport[1])],'viewport')
    run(['console','--clear'],'console-clear')
    run(['errors','--clear'],'errors-clear')
    if args.task=='news-search':
        open_page('/en/news','news-initial')
        run(['find','label','Search industrial furnace resources','fill','trolley'],'search-fill')
        run(['press','Enter'],'search-enter')
        search_form_submitted = True
        run(['wait','--fn',"location.pathname==='/en/news' && new URLSearchParams(location.search).get('q')==='trolley' && document.querySelector('[aria-labelledby=\"news-list-title\"]')?.getAttribute('aria-busy')!=='true' && document.querySelector('[aria-labelledby=\"news-list-title\"] a[href^=\"/en/news/\"]')!==null"],'search-results-ready')
        result=capture('search-results',"const links=Array.from(document.querySelectorAll('[aria-labelledby=\"news-list-title\"] a[href]')).filter(a=>pathOf(a).startsWith('/en/news/')&&shown(a)); observed.results=links.map(a=>({path:pathOf(a),text:norm(a.innerText),heading:norm(a.querySelector('h3')?.innerText),rect:rect(a)})); assertions.queryMatches=new URLSearchParams(location.search).get('q')==='trolley'; assertions.resultsRendered=links.length>0; assertions.inputRetained=document.querySelector('#news-center-search')?.value==='trolley';")
        first=result['observed']['results'][0]
        target=first['path']
        selector='[aria-labelledby="news-list-title"] a[href="'+target+'"]'
        if args.viewport=='mobile':
            title_selector=selector+' h3'
            run(['scrollintoview',title_selector],'search-detail-heading-scroll')
            ready_click="(() => {const h=document.querySelector("+json.dumps(title_selector)+");if(!h)return false;const r=h.getBoundingClientRect(),toolbar=document.querySelector('[data-contact-toolbar]')?.getBoundingClientRect();return r.y>=0&&r.bottom<=(toolbar?.top??innerHeight)&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('a')===h.closest('a');})()"
            run(['wait','--fn',ready_click],'search-detail-heading-uncovered')
            run(['find','first',title_selector,'click'],'search-detail-click')
        else:
            run(['find','first',selector,'click'],'search-detail-click')
        arrival(target,'search-detail',first['heading'])
        run(['back'],'search-back')
        ready('/en/news','search-return-heading-ready')
        run(['wait','--fn',"location.pathname==='/en/news' && new URLSearchParams(location.search).get('q')==='trolley' && document.querySelector('#news-center-search')?.value==='trolley'"],'search-back-ready')
        capture('search-return',"assertions.queryRestored=new URLSearchParams(location.search).get('q')==='trolley'; assertions.inputRestored=document.querySelector('#news-center-search')?.value==='trolley'; assertions.resultRestored=Array.from(document.querySelectorAll('[aria-labelledby=\"news-list-title\"] a[href]')).some(a=>pathOf(a)==="+json.dumps(target)+"&&shown(a));")
    elif args.task=='equipment-links':
        pairs=[(article,card) for article in frozen['articles'] for card in article['cards']]
        if args.viewport=='mobile':
            pairs=pairs[:1]
        for i,(article,card) in enumerate(pairs):
            name='equipment-'+str(i+1)
            open_page(article['path'],name+'-article')
            selector='[aria-labelledby="news-related-links-title"] a[href="'+card['href']+'"]'
            observed=evaluate('(() => {const a=document.querySelector('+json.dumps(selector)+');return {exists:!!a,title:a?.querySelector("h3")?.innerText,href:a?.getAttribute("href")};})()',name+'-entry')
            assert observed['exists'] and observed['title']==card['title'] and observed['href']==card['href']
            run(['click',selector],name+'-click')
            arrival(card['href'],name+'-arrival')
            run(['back'],name+'-back')
            ready(article['path'],name+'-return-ready')
            capture(name+'-return','assertions.articleRestored=location.pathname==='+json.dumps(article['path'])+'; assertions.articleHeadingRestored=norm(h?.innerText)==='+json.dumps(article['title'])+';')
    elif args.task=='trolley-resources':
        resources=frozen['englishTrolley']['resources']
        if args.viewport=='mobile':
            resources=resources[:1]
        for i,item in enumerate(resources):
            name='trolley-resource-'+str(i+1)
            open_page('/en/products/detail/trolley-furnace',name+'-product')
            selector='main a[href="'+item['path']+'"]'
            observed=evaluate('(() => {const a=document.querySelector('+json.dumps(selector)+');return {text:a?.querySelector("strong")?.innerText,href:a?.getAttribute("href")};})()',name+'-entry')
            assert observed['text']==item['title'] and observed['href']==item['path']
            run(['click',selector],name+'-click')
            arrival(item['path'],name+'-arrival')
            run(['back'],name+'-back')
            ready('/en/products/detail/trolley-furnace',name+'-return-ready')
            capture(name+'-return',"assertions.productRestored=location.pathname==='/en/products/detail/trolley-furnace';")
    else:
        open_page('/zh','contact-home')
        mobile=evaluate("({mobile:navigator.userAgentData?.mobile===true||/iPhone|iPod|Android.*Mobile|Windows Phone/i.test(navigator.userAgent)})",'contact-user-agent')
        assert mobile['mobile'] is False, 'Real-phone user agent would allow dialing; do not click.'
        guard="""(() => {document.addEventListener('click', event=>{const a=event.target.closest?.('a[href]');if(a&&/^(tel:|mailto:|weixin:|wechat:)/i.test(a.getAttribute('href')||''))event.preventDefault();},true);return {guard:'prevents native external-protocol activation only; original page handler still runs'};})()"""
        evaluate(guard,'external-protocol-safety-guard')
        for kind in ['wechat','phone']:
            target=evaluate("""(() => {const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';};
              const candidates=KIND==='wechat'?Array.from(document.querySelectorAll('button[aria-haspopup="dialog"]')).filter(e=>/微信|wechat/i.test(e.innerText+' '+e.getAttribute('aria-label'))):Array.from(document.querySelectorAll('a[href^="tel:"][aria-expanded]'));
              const element=candidates.find(visible); if(!element)return {found:false};
              const segments=[];let node=element;while(node&&node!==document.documentElement){if(node.id){segments.unshift('#'+CSS.escape(node.id));break;}const siblings=Array.from(node.parentElement.children).filter(e=>e.tagName===node.tagName);segments.unshift(node.tagName.toLowerCase()+':nth-of-type('+(siblings.indexOf(node)+1)+')');node=node.parentElement;}
              return {found:true,selector:segments.join(' > '),text:element.innerText,previousOverflow:document.body.style.overflow};})()""".replace('KIND',json.dumps(kind)),kind+'-trigger')
            assert target['found'], kind+' visible trigger missing'
            run(['scrollintoview',target['selector']],kind+'-trigger-scroll')
            run(['snapshot','-i','-u'],kind+'-before-click-snapshot')
            run(['click',target['selector']],kind+'-open-click')
            contact_clicked=True
            wait="!!document.querySelector('[data-contact-dialog=\""+kind+"\"]')"
            if kind=='wechat':
                wait+=" && document.querySelector('[data-contact-dialog=\"wechat\"] img')?.complete && document.querySelector('[data-contact-dialog=\"wechat\"] img')?.naturalWidth>0"
            run(['wait','--fn',wait],kind+'-dialog-ready')
            custom="const dialog=document.querySelector('[data-contact-dialog=\""+kind+"\"]'); const r=rect(dialog); observed.dialog={text:norm(dialog?.innerText),rect:r}; assertions.dialogOpened=shown(dialog); assertions.dialogWithinViewport=!!r&&r.x>=-1&&r.y>=-1&&r.x+r.width<=innerWidth+1&&r.y+r.height<=innerHeight+1; assertions.closeControlRendered=shown(dialog?.querySelector('[aria-label=\"关闭联系弹窗\"]'));"
            if kind=='wechat':
                custom+="const qr=dialog?.querySelector('img'); observed.qr={complete:qr?.complete,naturalWidth:qr?.naturalWidth,rect:rect(qr)}; assertions.qrRendered=shown(qr)&&qr.complete&&qr.naturalWidth>0;"
            else:
                custom+="assertions.phoneValueRendered=/130\\s*5298\\s*6814/.test(norm(dialog?.innerText));"
            dialog_state=capture(kind+'-dialog',custom)
            contact_opened=contact_opened or dialog_state['assertions']['dialogOpened']
            run(['press','Escape'],kind+'-escape')
            run(['wait','--fn',"document.querySelector('[role=\"dialog\"]')===null"],kind+'-closed-ready')
            capture(kind+'-closed',"assertions.dialogClosed=document.querySelector('[role=\"dialog\"]')===null; assertions.focusRestored=document.activeElement===document.querySelector("+json.dumps(target['selector'])+"); assertions.bodyScrollRestored=document.body.style.overflow==="+json.dumps(target['previousOverflow'])+';')
except Exception as error:
    failure=_SANITIZER.redact_text(str(error))
finally:
    console_ok=errors_ok=False
    console_count=error_count=None
    try:
        messages=run(['console'],'console')['messages']
        console_count=len(messages)
        text='\n'.join('['+str(m.get('type',m.get('level','unknown')))+'] '+str(m.get('text',m.get('message',json.dumps(m,ensure_ascii=False)))) for m in messages)
        if text:
            (out/'console.log').write_text(text)
        console_ok=re.search(r'hydrat|did not match|\[(error|warn(ing)?)\]',text,re.I) is None
        errors=run(['errors'],'errors')['errors']
        error_count=len(errors)
        if errors:
            (out/'errors.log').write_text('\n'.join(json.dumps(e,ensure_ascii=False) for e in errors))
        errors_ok=len(errors)==0
    except Exception as error:
        failure=failure or _SANITIZER.redact_text(str(error))
    passed=failure is None and len(states)>0 and all(all(s['assertions'].values()) for s in states) and console_ok and errors_ok
    receipt={'atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'real-browser','phase':args.phase,'sourceCommit':plan['sourceCommit'],'runtimeImage':plan['runtimeImage'],'planSha256':args.plan_sha256,'identityBeforeInput':str(pathlib.Path(args.identity_before).resolve()),'task':args.task,'viewport':viewport,'session':session,'attempt':args.attempt,'passed':passed,'collectorFailure':failure,'states':states,'actualNavigationArrivals':navigations,'contactClicked':contact_clicked,'contactDialogOpened':contact_opened,'externalContactActivated':False,'formSubmitted':False,'leadFormSubmitted':False,'searchFormSubmitted':search_form_submitted,'collectorFile':'browser/capture-interactions.py','collectorSourceSha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),'acceptancePlanSha256':hashlib.sha256(frozen_bytes).hexdigest(),'consoleRawFile':'console.raw.json','errorsRawFile':'errors.raw.json','consoleMessageCount':console_count,'runtimeErrorCount':error_count,'commands':commands,'boundFilesSha256':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in out.iterdir() if f.is_file()},'limits':['Separate from read-only base view report.','formSubmitted refers to inquiry/lead forms; read-only GET search submission is recorded separately.','Mobile means viewport size with desktop user agent; real dialing is excluded.','Phone contact check installs an explicit native external-protocol prevention guard, while preserving the page handler.','Desktop covers all 5 equipment and 3 trolley destinations; mobile checks one representative of each.','No lead form submissions, calls, outgoing WeChat/email or clipboard writes.','Empty extra console/error logs are not generated; actual zero-count raw JSON is retained.']}
    with (out/'interaction-receipt.json').open('x') as handle:json.dump(receipt,handle,ensure_ascii=False,indent=2);handle.write('\n')
if not passed:
    raise SystemExit('Interaction failed: '+str(out))
