/* Actual owned-browser acceptance. Real mouse/keyboard input; no lead submission. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert/strict');
const { createRequire } = require('module');
const { execFileSync } = require('child_process');
const observationSource = "(() => {\n  const text = e => (e?.innerText || e?.textContent || '').replace(/\\s+/g, ' ').trim();\n  const box = e => {\n    if (!e) return null;\n    const r = e.getBoundingClientRect(), s = getComputedStyle(e);\n    return {x:r.x, y:r.y, width:r.width, height:r.height, bottom:r.bottom,\n      display:s.display, visibility:s.visibility, fontSize:s.fontSize,\n      position:s.position, overflowX:s.overflowX, overflowY:s.overflowY,\n      clientWidth:e.clientWidth, scrollWidth:e.scrollWidth,\n      clientHeight:e.clientHeight, scrollHeight:e.scrollHeight,\n      scrollLeft:e.scrollLeft, scrollTop:e.scrollTop};\n  };\n  const shown = e => {\n    const r = box(e);\n    return !!r && r.width > 0 && r.height > 0 && r.display !== 'none' && r.visibility !== 'hidden';\n  };\n  const describe = e => ({tag:e.tagName, text:text(e), box:box(e), shown:shown(e),\n    id:e.id, role:e.getAttribute('role'), href:e.getAttribute('href'),\n    expanded:e.getAttribute('aria-expanded'), controls:e.getAttribute('aria-controls'),\n    selected:e.getAttribute('aria-selected'), pressed:e.getAttribute('aria-pressed'),\n    label:e.getAttribute('aria-label'), disabled:e.disabled || false});\n  const list = (s, root=document) => [...root.querySelectorAll(s)];\n  const toolbar = document.querySelector('[data-contact-toolbar]');\n  const form = document.querySelector('[data-contact-form]');\n  const menus = list('[role=\"listbox\"]');\n  const h1 = list('main h1').map(describe);\n  const images = list('img').filter(e => shown(e) && (e.closest('[role=\"dialog\"]') || /structur|cutaway|结构|原图|QR|二维码/i.test(e.alt || '') || e.closest('figure')));\n  return {\n    atUtc:new Date().toISOString(), url:location.href,\n    viewport:{width:innerWidth,height:innerHeight}, scrollY,\n    documentWidth:document.documentElement.scrollWidth,\n    overflow:document.documentElement.scrollWidth > innerWidth + 1,\n    bodyStyle:{overflow:getComputedStyle(document.body).overflow},\n    header:box(document.querySelector('header')), h1,\n    active:document.activeElement ? describe(document.activeElement) : null,\n    toolbar:toolbar ? {box:box(toolbar), shown:shown(toolbar), items:list(':scope > button,:scope > a',toolbar).map(e => ({...describe(e),icons:list('svg',e).map(i => ({box:box(i),shown:shown(i)})),circles:list(':scope > span',e).map(describe)}))} : null,\n    dialogs:list('[role=\"dialog\"]').filter(shown).map(e => ({...describe(e),controls:list('button,a',e).map(describe)})),\n    images:images.map(e => ({alt:e.alt,src:e.currentSrc || e.src,complete:e.complete,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,box:box(e)})),\n    forms:list('[data-contact-form]').map(e => ({...describe(e),fields:list('input:not([type=\"hidden\"]),textarea,button[aria-haspopup=\"listbox\"]',e).map(i => ({...describe(i),name:i.name,value:i.value || '',inputType:i.type})),direction:e.querySelector('input[name=\"direction\"]')?.value || '',summaries:list('[data-workpiece-summary]',e).map(describe),privacy:list('details',e).map(e => ({...describe(e),open:e.open}))})),\n    menus:menus.map(e => ({...describe(e),placement:e.getAttribute('data-placement'),options:list('[role=\"option\"]',e).map(describe)})),\n    workpieces:list('[data-workpiece-id]').map(describe),\n    rails:list('[role=\"region\"]').filter(e=>e.querySelector('[data-production-line-card]')).map(e => ({...describe(e),cards:list('[data-production-line-card]',e).map(describe)})),\n    carouselControls:list('nav,select').filter(e=>/production line|生产线|产线|目录/i.test(e.getAttribute('aria-label') || text(e))).map(e=>({...describe(e),controls:list('button,option,[role=\"status\"]',e).map(describe)})),\n    details:list('main details').map(e => ({...describe(e),open:e.open,summary:describe(e.querySelector('summary'))})),\n    tables:list('main table').map(e => ({box:box(e),parent:box(e.parentElement),rows:list('tr',e).map(row=>list('th,td',row).map(cell=>({text:text(cell),box:box(cell),whiteSpace:getComputedStyle(cell).whiteSpace}))) })),\n    anchorLinks:list('main a[href*=\"#\"]').filter(shown).map(describe),\n    news:{results:list('[data-news-id]').map(e=>({id:e.getAttribute('data-news-id'),text:text(e),box:box(e)})),controls:list('main button,main select,main input,main a').filter(e=>shown(e)&&(/filter|筛选|选择|select|search|搜索|equipment|选型|sort|排序|next|下一|previous|上一|第\\s*\\d|newest|最新/i.test(text(e)||e.getAttribute('aria-label')||e.getAttribute('placeholder')||''))).map(describe)},\n    draftSubmissionGuard:window.__mobile86NoSubmit || null,\n    userInputEvents:window.__mobile86InputEvents || [],\n    qaSessionMatches:!!sessionStorage.getItem('suneng_session_id') && sessionStorage.getItem('suneng_session_id')===sessionStorage.getItem('suneng_manual_qa_session_v1'),\n    localTrackingSuppressed:location.hostname==='127.0.0.1' && sessionStorage.getItem('suneng_session_id')===null\n  };\n})()\n";

function safeRoot(value) {
  assert(typeof value === 'string' && path.isAbsolute(value), 'absolute --root required');
  const result = path.resolve(value);
  let current = result;
  for (;;) {
    assert(!fs.lstatSync(current).isSymbolicLink(), 'symlink root refused');
    const parent = path.dirname(current); if (parent === current) break; current = parent;
  }
  assert(fs.statSync(result).isDirectory(), 'existing root required'); return result;
}
function safeRead(file) {
  let current = file;
  for (;;) {
    assert(!fs.lstatSync(current).isSymbolicLink(), 'symlink input refused');
    const parent = path.dirname(current); if (parent === current) break; current = parent;
  }
  const before=fs.statSync(file);
  assert(before.isFile() && before.nlink===1 && before.size<=32*1024*1024,'bounded regular input required');
  const bytes=fs.readFileSync(file),after=fs.statSync(file);
  assert(before.ino===after.ino && before.dev===after.dev && before.size===after.size &&
    before.mtimeMs===after.mtimeMs && before.ctimeMs===after.ctimeMs,'input changed during read');
  return bytes;
}
function captureBudget(contexts=3,navigationMs=45000,actionMs=45000) {
  assert(Number.isInteger(contexts)&&contexts>=1&&contexts<=24,'bounded context count');
  assert(Number.isInteger(navigationMs)&&navigationMs>=1000&&navigationMs<=90000,'bounded navigation budget');
  assert(Number.isInteger(actionMs)&&actionMs>=1000&&actionMs<=180000,'bounded action budget');
  const total=contexts*navigationMs+actionMs;assert(total<=600000,'bounded total budget');return total;
}
function freshOutput(value) {
  const result=path.resolve(value);let current=path.dirname(result);
  for(;;){
    if(fs.existsSync(current))assert(!fs.lstatSync(current).isSymbolicLink(),'symlink output refused');
    const parent=path.dirname(current);if(parent===current)break;current=parent;
  }
  fs.mkdirSync(path.dirname(result),{recursive:true,mode:0o700});
  fs.mkdirSync(result,{mode:0o700});safeRoot(result);return result;
}
function createActions(targetPage,{timeoutMs=15000,stableMs=300}={}) {
  assert(Number.isInteger(timeoutMs)&&timeoutMs>=100&&timeoutMs<=60000,'bounded action timeout');
  assert(Number.isInteger(stableMs)&&stableMs>=30&&stableMs<=1000,'bounded scroll stability');
  async function settle() {
    await targetPage.waitForFunction(({stable})=>{
      const value=window.__releaseScrollStable,now=performance.now();
      if(!value||value.x!==scrollX||value.y!==scrollY)window.__releaseScrollStable={x:scrollX,y:scrollY,at:now};
      return now-window.__releaseScrollStable.at>=stable;
    },{stable:stableMs},{timeout:timeoutMs});
  }
  async function visible(locator) {
    const until=Date.now()+timeoutMs;
    do {
      const found=[];const count=await locator.count();assert(count<=100,'too many click targets');
      for(let i=0;i<count;i++)if(await locator.nth(i).isVisible())found.push(locator.nth(i));
      assert(found.length<=1,'visible click target is not unique');
      if(found.length===1)return found[0];
      await targetPage.waitForTimeout(30);
    }while(Date.now()<until);
    throw new Error('visible click target not found');
  }
  async function expose(locator) {
    const target=await visible(locator);
    await target.evaluate(e=>e.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
    await settle();return target;
  }
  async function click(locator) {
    const target=await expose(locator);
    await target.click({trial:true,timeout:timeoutMs});await settle();
    const before=await target.evaluate(e=>{
      const b=e.getBoundingClientRect(),x=b.x+b.width/2,y=b.y+b.height/2;
      return {centerHit:b.width>0&&b.height>0&&x>=0&&x<innerWidth&&y>=0&&y<innerHeight&&
        e.contains(document.elementFromPoint(x,y)),width:b.width,height:b.height,tag:e.tagName};
    });
    assert(before.centerHit,'click target center is covered or outside viewport');
    await target.click({position:{x:before.width/2,y:before.height/2},timeout:timeoutMs});
    await settle();return before;
  }
  return {settle,expose,click};
}

async function main(argv=process.argv.slice(2)) {
const cli = Object.fromEntries(argv.map(x => x.split(/=(.*)/s).slice(0, 2)));
const root = safeRoot(cli['--root']);
assert(!cli['--attempt'] || /^[1-9][0-9]{0,3}$/.test(cli['--attempt']), 'bounded numeric attempt required');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const planRaw = safeRead(path.join(root, 'plan.json'));
assert.equal(sha(planRaw), cli['--plan-sha256']);
const plan = JSON.parse(planRaw);
assert(/^[a-f0-9]{40}$/.test(plan.sourceCommit)&&/^sha256:[a-f0-9]{64}$/.test(plan.runtimeImage),
  'full source and runtime image required');
const identityPath = path.resolve(cli['--identity-before']);
assert(!path.relative(root,identityPath).startsWith('..') && !path.isAbsolute(path.relative(root,identityPath)), 'identity must belong to root');
const identityRaw = safeRead(identityPath);
assert.equal(sha(identityRaw),cli['--identity-sha256'],'bound identity digest required');
const identity = JSON.parse(identityRaw);
assert.equal(identity.container.source, plan.sourceCommit);
assert.equal(identity.container.image, plan.runtimeImage);
assert(identity.readOnly && identity.container.running && identity.container.health === 'healthy');
const phase = cli['--phase'];
assert(['candidate', 'production'].includes(phase));
const origin = new URL(identity.baseUrl);
assert(!origin.username&&!origin.password&&!origin.search&&!origin.hash,'plain capture origin required');
assert(phase==='candidate' ? origin.protocol==='http:'&&origin.hostname==='127.0.0.1'&&
  /^[0-9]+$/.test(origin.port)&&Number(origin.port)>0 : identity.baseUrl==='https://www.jssngyl.cn',
  'bound candidate or production origin required');
const cfgRaw = safeRead(path.join(root,'release-config.json'));
assert.equal(sha(cfgRaw),cli['--release-config-sha256'],'bound dependency config required');
const cfg = JSON.parse(cfgRaw);
assert.equal(cfg.sourceCommit,plan.sourceCommit,'capture dependency source required');
assert(typeof cfg.sourceWorktree==='string'&&path.isAbsolute(cfg.sourceWorktree),'absolute source workspace required');
assert.equal(execFileSync('git',['-C',cfg.sourceWorktree,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),plan.sourceCommit);
assert.equal(execFileSync('git',['-C',cfg.sourceWorktree,'status','--porcelain'],{encoding:'utf8'}),'',
  'clean source workspace required');
const { chromium, expect } = createRequire(path.join(cfg.sourceWorktree, 'frontend/package.json'))('@playwright/test');
const observe = observationSource;
const methodSha = sha(fs.readFileSync(__filename));
assert.equal(methodSha,cli['--method-sha256'],'bound collector digest required');
const marker = plan.qaMarker;
const mobile = {width:390, height:844}, desktop = {width:1440, height:900};
const trigger = '[data-contact-form] button[aria-haspopup="listbox"]';
const form = '[data-contact-form]';
const sanitize = x => {
  if (typeof x === 'string') return x.replace(/https:\/\/zhanzhang\.toutiao\.com\/s\.gif\?[^\s"'<>]+/gi, 'https://zhanzhang.toutiao.com/s.gif [redacted]')
    .replace(/([?&]token=)[^&\s"'<>]+/gi, '$1[REDACTED]').replace(/(?<![0-9a-f])[0-9a-f]{128,}(?![0-9a-f])/gi, '[REDACTED]');
  if (Array.isArray(x)) return x.map(sanitize);
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k,v]) => [k, sanitize(v)]));
  return x;
};
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(sanitize(value), null, 2)+'\n', {flag:'wx', mode:0o600});
let page, context, out, log, checks, seq;
async function action(name, fn) {
  const at = new Date().toISOString();
  try { const value = await fn(); const receiptValue = value == null || ['string','number','boolean'].includes(typeof value) ? value??null : typeof value.status==='function' ? {status:value.status(),path:new URL(value.url()).pathname} : null; log.push({name, at, completedAt:new Date().toISOString(), passed:true, value:receiptValue}); return value; }
  catch (e) { log.push({name, at, completedAt:new Date().toISOString(), passed:false, error:String(e)}); throw e; }
}
function check(name, condition, evidence=null) { checks.push({name, passed:!!condition, evidence}); assert(condition, name); }
async function ready() { await expect(page.locator('main h1').first()).toBeVisible(); await page.waitForFunction(() => document.readyState === 'complete' && document.querySelector('main')?.innerText.trim().length > 50); }
async function goto(route, view=mobile) {
  await action('actual-viewport', () => page.setViewportSize(view));
  const u = new URL(route, identity.baseUrl); u.searchParams.set('acquisition_qa',marker);
  const response = await action('GET-page', () => page.goto(u.href, {waitUntil:'load', timeout:45000}));
  check('HTML-page-200-'+route, response.status() === 200, response.status());
  await ready(); await page.waitForTimeout(1500); await settle();
}
async function settle() { await createActions(page).settle(); }
async function expose(locator) { return createActions(page).expose(locator); }
async function click(locator,name) { return action(name,()=>createActions(page).click(locator)); }
async function snap(name) {
  seq++; const prefix = String(seq).padStart(2,'0')+'-'+name;
  await page.screenshot({path:path.join(out,prefix+'.png')});
  const dom = await page.evaluate(observe); write(path.join(out,prefix+'.dom.json'),dom);
  check('document-fits-'+prefix,!dom.overflow, {width:dom.documentWidth,viewport:dom.viewport});
  return dom;
}
async function directionOpen() { await click(page.locator(trigger),'direction-trigger-click'); await expect(page.getByRole('listbox')).toBeVisible(); await page.waitForFunction(() => document.activeElement?.getAttribute('role')==='option'); }
async function selected() { return await page.locator(form+' input[name=direction]').inputValue(); }
async function fieldClearance() {
  const value=await page.evaluate(() => { const e=document.activeElement,r=e.getBoundingClientRect(),hs=[...document.querySelectorAll('header.site-header > div')].filter(x=>getComputedStyle(x).position==='fixed').map(x=>x.getBoundingClientRect()).filter(x=>x.height&&x.top<=1),b=document.querySelector('[data-mobile-contact-bar]')?.getBoundingClientRect(),barTop=b&&b.width>=innerWidth*0.8&&b.bottom>=innerHeight-2?b.y:innerHeight; return {y:r.y,bottom:r.bottom,headerBottom:Math.max(0,...hs.map(x=>x.bottom)),barTop,fontSize:parseFloat(getComputedStyle(e).fontSize),height:r.height,tag:e.tagName,centerHit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}; });
  check('focused-field-clear',value.y>=value.headerBottom-1 && value.bottom<=value.barTop+1 && value.height>=44 && value.centerHit, value);
}
async function actualWheel(locator,dx,dy) {
  await expose(locator); const b=await locator.boundingBox(); assert(b); await page.mouse.move(b.x+b.width/2,b.y+b.height/2);
  await action('real-mouse-wheel',() => page.mouse.wheel(dx,dy)); await settle(); await page.waitForTimeout(250);
}
async function siteHeaderBox(){return await page.locator('header.site-header').evaluate(e=>{const bounds=[...e.children].filter(x=>getComputedStyle(x).position==='fixed').map(x=>x.getBoundingClientRect()).filter(x=>x.height&&x.top<=1);const bottom=Math.max(0,...bounds.map(x=>x.bottom));return {x:0,y:0,width:innerWidth,height:bottom,bottom};});}
async function existingInquiryLink(locale) {
  const footer=page.locator('footer a[href*="inquiry"],footer a[href*="#homepage-lead-form"]');
  let entry;
  if(await footer.count()) entry=footer.first();
  else if(page.viewportSize().width<1280){
    await page.locator('[aria-controls="mobile-navigation-dialog"]').click();
    entry=page.locator('#mobile-navigation-dialog a').filter({hasText:locale==='en'?/Online inquiry/i:/在线询价/}).first();
  }else entry=page.getByRole('button',{name:locale==='en'?'Request an assessment':'提交工况，获取工程判断',exact:true});
  const origin={tag:await entry.evaluate(e=>e.tagName),label:await entry.innerText(),footerInquiryPresent:await footer.count()>0};
  log.push({name:'source-preserved-existing-inquiry-entry',at:new Date().toISOString(),value:origin});
  await click(entry,'existing-inquiry-anchor'); await expect(page.locator(form)).toHaveCount(1); if(page.viewportSize().width>=1280){await page.locator(trigger).click();await expect(page.getByRole('option').first()).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByRole('listbox')).toHaveCount(0);await expect(page.locator(trigger)).toBeFocused();log.push({name:'desktop-existing-CTA-scroll-then-real-field-click',at:new Date().toISOString()});} await page.waitForFunction(() => document.activeElement?.id==='homepage-direction-trigger'); await settle(); await fieldClearance();
}
async function dropdownLifecycle(route,locale,view=mobile,allHit=false) {
  await goto(route,view);
  if(await page.locator('[aria-controls="contact-message-panel"]').count() && !await page.locator(form).count()) await click(page.locator('[aria-controls="contact-message-panel"]'),'open-existing-contact-panel');
  await expect(page.locator(form)).toHaveCount(1);
  await page.locator(form+' textarea[name=problem]').fill('QA_ONLY_UNSENT '+plan.sourceCommit.slice(0,12));
  await directionOpen(); const opened=await snap('direction-open');
  const geometry=await page.getByRole('listbox').evaluate(m => {const r=m.getBoundingClientRect(),bar=document.querySelector('[data-mobile-contact-bar]')?.getBoundingClientRect();return {placement:m.dataset.placement,y:r.y,bottom:r.bottom,barTop:bar?.y??innerHeight,scrollHeight:m.scrollHeight,clientHeight:m.clientHeight,options:[...m.querySelectorAll('[role=option]')].map(o=>{const r=o.getBoundingClientRect();return {text:o.textContent.trim(),height:r.height,x:r.x+r.width/2,y:r.y+r.height/2,hit:m.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};})};});
  check('menu-six-options',geometry.options.length===6,geometry);
  check('menu-fits-viewport',geometry.y>=0 && geometry.bottom<=geometry.barTop+1,geometry);
  check('options-minimum-44',geometry.options.every(o=>o.height>=44),geometry);
  if(allHit) check('all-six-options-reachable',geometry.options.every(o=>o.hit && o.y>=0 && o.y<geometry.barTop),geometry);
  await page.evaluate(() => scrollBy(0,30)); await settle(); await expect(page.getByRole('listbox')).toBeVisible();
  check('programmatic-scroll-preserves-menu',await page.getByRole('listbox').count()===1);
  await actualWheel(page.getByRole('listbox'),0,80); await expect(page.getByRole('listbox')).toBeVisible();
  const events=await page.evaluate(() => window.__releaseSafety.events.filter(x=>x.type==='wheel').slice(-1));
  check('actual-trusted-wheel-inside-menu',events.length===1 && events[0].trusted && events[0].insideMenu,events);
  checks.push({name:'internal-overflow-applicable',passed:true,evidence:{applicable:geometry.scrollHeight>geometry.clientHeight,dimensions:geometry,physicalTouchTested:false}});
  await page.getByRole('option',{name:locale==='en'?'After-sales or other support':'售后或其他',exact:true}).click();
  await expect(page.locator(trigger)).toBeFocused(); await expect(page.getByRole('listbox')).toHaveCount(0); const value=await selected();check('after-sales-selected',!!value,value);
  await directionOpen(); await page.keyboard.press('Escape'); await expect(page.getByRole('listbox')).toHaveCount(0); await expect(page.locator(trigger)).toBeFocused();
  await directionOpen(); await page.mouse.move(8,400); await page.mouse.wheel(0,80); await expect(page.getByRole('listbox')).toHaveCount(0); await settle();
  await directionOpen(); await page.setViewportSize({width:view.width+1,height:view.height}); await expect(page.getByRole('listbox')).toHaveCount(0); await page.setViewportSize(view);
  await directionOpen(); await page.keyboard.press('Tab'); await expect(page.getByRole('listbox')).toHaveCount(0);
  await directionOpen(); const outsideHit=await page.evaluate(()=>{const e=document.elementFromPoint(8,400);return !!e&&!e.closest('[role=listbox]')&&!e.closest('a,button,input,textarea')});check('safe-uncovered-outside-pointer-target',outsideHit);await action('real-outside-pointer',()=>page.mouse.click(8,400));await settle(); await expect(page.getByRole('listbox')).toHaveCount(0);
  check('all-closes-preserve-selection',await selected()===value);
  check('all-closes-preserve-draft',await page.locator(form+' textarea[name=problem]').inputValue()==='QA_ONLY_UNSENT '+plan.sourceCommit.slice(0,12));
  await snap('direction-final');
}

const cases = {
  '01': async()=> { for(const route of ['/zh','/zh/inquiry']) { await goto(route); const d=await snap('toolbar-'+route.split('/').pop()); const b=d.toolbar; check('four-Chinese-contact-items',b.items.length===4 && b.items.map(x=>x.text).join('|').includes('微信') && b.items.map(x=>x.text).join('|').includes('电话') && !b.items.some(x=>/询价|询盘/.test(x.text)),b); check('mobile-item-height',b.items.every(x=>x.box.height>=64),b); } },
  '02': async()=> { await goto('/en/contact'); const d=await snap('toolbar-en');check('four-localized-items',d.toolbar.items.map(x=>x.text).join('|')==='WeChat|Call|Email|Top',d.toolbar); },
  '03': async()=> {for(const l of ['zh','en']){await goto('/'+l,desktop);const d=await snap(l+'-desktop');check('desktop-toolbar-dimensions',Math.abs(d.toolbar.box.width-72)<1 && d.toolbar.items.every(x=>Math.abs(x.box.height-92)<1),d.toolbar);await existingInquiryLink(l);await snap(l+'-footer-form');}},
  '04': async()=> {await goto('/zh');const button=page.locator('[data-contact-toolbar] > button[aria-haspopup="dialog"]').first();await button.click();const dialog=page.locator('[data-contact-dialog="wechat"]');await expect(dialog).toBeVisible();await page.waitForFunction(()=>{const i=document.querySelector('[data-contact-dialog="wechat"] img');return i?.complete && i.naturalWidth>0});check('manual-wechat-fallback',(await dialog.innerText()).includes('suneng2005'));check('original-image-link',await dialog.locator('a[target="_blank"]').count()>0);await snap('wechat-loaded');await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(button).toBeFocused();await button.click();await dialog.getByRole('button',{name:'关闭联系弹窗',exact:true}).click();await expect(button).toBeFocused();check('body-scroll-restored',await page.evaluate(()=>getComputedStyle(document.body).overflow!=='hidden'));await snap('wechat-closed');},
  '05': async()=> {await goto('/en/contact');for(const kind of ['phone','email']){const label=kind==='phone'?'Call':'Email';const button=page.locator('[data-contact-toolbar]').getByRole('link',{name:label,exact:true});await button.click();const dialog=page.locator('[data-contact-dialog="'+kind+'"]');await expect(dialog).toBeVisible();check('English-dialog',!/关闭|复制|拨打/.test(await dialog.innerText()));await snap(kind+'-dialog');await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(button).toBeFocused();await button.click();await dialog.getByRole('button',{name:'Close contact dialog',exact:true}).click();await expect(button).toBeFocused();}await snap('contact-dialogs-closed');},
  '06': async()=> {for(const l of ['zh','en']){await goto('/'+l);await page.mouse.move(200,400);await page.mouse.wheel(0,1100);await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(500);await settle();check('real-down-scroll',await page.evaluate(()=>scrollY>500));await snap(l+'-down');await page.locator('[data-contact-toolbar]').getByRole('button',{name:l==='en'?'Top':'返回顶部',exact:true}).click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);await snap(l+'-top');}},
  '07': async()=> {await goto('/zh');await page.locator('[aria-controls="mobile-navigation-dialog"]').click();const menu=page.locator('#mobile-navigation-dialog');await expect(menu).toBeVisible();const group=menu.getByRole('button',{name:'改造与服务',exact:true});await group.click();await expect(group).toHaveAttribute('aria-expanded','true');check('category-not-navigation',new URL(page.url()).pathname==='/zh');await snap('menu-expanded');await group.click();await expect(group).toHaveAttribute('aria-expanded','false');await group.click();const overview=menu.locator('a[href="/zh/service"]').first();await overview.click();await page.waitForURL(u=>u.pathname==='/zh/service');await expect(menu).toHaveCount(0);await settle();await snap('service-overview');check('body-unlocked',await page.evaluate(()=>getComputedStyle(document.body).overflow!=='hidden'));},
  '08': async()=> {await goto('/en');await page.locator('[aria-controls="mobile-navigation-dialog"]').click();const menu=page.locator('#mobile-navigation-dialog');await menu.locator('a').filter({hasText:/Online inquiry|Inquiry/i}).first().click();await expect(menu).toHaveCount(0);await expect(page.locator(form)).toHaveCount(1);await page.waitForFunction(()=>document.activeElement?.id==='homepage-direction-trigger');await settle();await fieldClearance();check('English-form-path',new URL(page.url()).pathname.startsWith('/en'));await snap('English-menu-inquiry');await goto('/en');await page.locator('[aria-controls="mobile-navigation-dialog"]').click();const language=page.locator('#mobile-navigation-dialog a').filter({hasText:/中文|CN/}).first();await language.click();await page.waitForURL(u=>u.pathname==='/zh');await ready();await snap('language-zh');},
  '09': async()=> {await goto('/zh');const choice=page.locator('[data-workpiece-id="pressure-vessel-shell"]');await click(choice,'workpiece-pressure-shell');await click(page.getByRole('button',{name:'提交工况，获取工程判断',exact:true}),'global-assessment-link');await expect(page.locator('[data-workpiece-summary]')).toContainText(/筒体|容器/);await page.locator(form+' textarea[name=problem]').fill('QA_ONLY_UNSENT draft-retention');await page.locator(form+' input[name=identity]').fill('QA_ONLY_UNSENT');await page.locator(form+' input[name=contact]').fill('QA_ONLY_UNSENT');await snap('first-summary');await click(page.locator('[data-workpiece-summary] button'),'modify-workpiece');await expect(choice).toBeFocused();await click(page.locator('[data-workpiece-id="structural-steel-component"]'),'steel-workpiece');await click(page.getByRole('button',{name:'提交工况，获取工程判断',exact:true}),'assessment-again');check('problem-draft-preserved',await page.locator(form+' textarea[name=problem]').inputValue()==='QA_ONLY_UNSENT draft-retention');await expect(page.locator('[data-workpiece-summary]')).toContainText(/钢结构/);await snap('changed-summary');},
  '10': async()=> {await goto('/en');await click(page.locator('[data-workpiece-id="pressure-vessel-shell"]'),'English-workpiece');await click(page.getByRole('button',{name:'Request an assessment',exact:true}),'English-assessment');const text=await page.locator('[data-workpiece-summary]').innerText();check('English-workpiece-summary',/shell|vessel/i.test(text)&&!/[\u4e00-\u9fa5]/.test(text),text);await snap('English-summary');await directionOpen();await snap('English-directions');await page.keyboard.press('Escape');},
  '11': async()=>dropdownLifecycle('/zh/inquiry','zh',mobile,true),
  '12': async()=> {await goto('/zh/inquiry',desktop);await directionOpen();await page.keyboard.press('End');await expect(page.locator('[role=option]:last-child')).toBeFocused();await page.keyboard.press('Home');await expect(page.locator('[role=option]:first-child')).toBeFocused();await page.keyboard.press('ArrowDown');await expect(page.getByRole('option',{name:'新建热处理生产线',exact:true})).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator(trigger)).toContainText('新建热处理生产线');await expect(page.locator(trigger)).toBeFocused();await snap('keyboard-selected');await directionOpen();await page.keyboard.press('Escape');await expect(page.locator(trigger)).toBeFocused();await directionOpen();await page.keyboard.press('Tab');await expect(page.getByRole('listbox')).toHaveCount(0);await snap('keyboard-closed');},
  '13': async()=> {await goto('/zh/inquiry');check('single-form',await page.locator(form).count()===1);const guidance=page.locator('main details').first();await click(guidance.locator('summary'),'guidance-expand');await expect(guidance).toHaveAttribute('open','');await page.locator(form+' textarea[name=problem]').fill('QA_ONLY_UNSENT guidance');await click(guidance.locator('summary'),'guidance-collapse');check('draft-unchanged',await page.locator(form+' textarea[name=problem]').inputValue()==='QA_ONLY_UNSENT guidance');const privacy=page.locator(form+' button[aria-controls]').filter({hasText:/隐私/}).first();await click(privacy,'privacy-open');await snap('privacy-open');await click(privacy,'privacy-close');await existingInquiryLink('zh');const fonts=await page.locator(form+' input:not([type=hidden]),'+form+' textarea').evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).fontSize)));check('mobile-input-font-minimum16',fonts.every(x=>x>=16),fonts);await click(page.locator(form+' input[name=contact]'),'last-contact-field-focus');await fieldClearance();await snap('compact-form');},
  '14': async()=> {await goto('/en/contact#contact-inquiry-form');await expect(page.locator(form)).toHaveCount(1);await page.waitForFunction(()=>document.activeElement?.id==='homepage-direction-trigger');await settle();await fieldClearance();await page.locator(form+' textarea[name=problem]').fill('QA_ONLY_UNSENT English retained');await snap('English-anchor-form');const toggle=page.locator('[aria-controls="contact-message-panel"]');await click(toggle,'close-contact-panel');await expect(page.locator(form)).not.toBeVisible();await click(toggle,'reopen-contact-panel');await expect(page.locator(form)).toHaveCount(1);check('contact-draft-retained',await page.locator(form+' textarea[name=problem]').inputValue()==='QA_ONLY_UNSENT English retained');await snap('English-reopened');},
  '15': async()=> {for(const route of ['/zh/inquiry','/en/contact#contact-inquiry-form']){await goto(route,desktop);await expect(page.locator(form)).toHaveCount(1);await expose(page.locator(trigger));const d=await snap(route.startsWith('/en')?'en-form-desktop':'zh-form-desktop');check('desktop-form-fields',d.forms[0].fields.length>=4,d.forms[0]);}},
  '16': async()=> {await goto('/zh/products');const rail=page.locator('#production-line-rail'),directory=page.locator('select[aria-controls="production-line-rail"]'),next=page.getByRole('button',{name:'查看下一组生产线',exact:true}),prev=page.getByRole('button',{name:'查看上一组生产线',exact:true});const options=await directory.locator('option').evaluateAll(es=>es.map(e=>({value:e.value,text:e.textContent.trim()})));check('actual-directory-options',options.length>3,options);const mid=Math.floor(options.length/2);await expose(directory);await directory.selectOption(options[mid].value);await expect.poll(()=>directory.inputValue()).toBe(options[mid].value);await page.waitForTimeout(500);await snap('directory-middle');await next.click();await page.waitForTimeout(500);check('arrow-directory-sync',await directory.inputValue()!==options[mid].value);await directory.selectOption(options.at(-1).value);await page.waitForTimeout(500);await expect(next).toBeDisabled();await snap('directory-last');await prev.click();await page.waitForTimeout(500);const before=await rail.evaluate(e=>e.scrollLeft);await actualWheel(rail,-450,0);await expect.poll(()=>rail.evaluate(e=>e.scrollLeft)).toBeLessThan(before);const gesture=await page.evaluate(()=>window.__releaseSafety.events.filter(e=>e.type==='wheel').at(-1));check('real-horizontal-wheel-gesture',gesture.trusted && gesture.deltaX!==0,gesture);await snap('rail-after-real-gesture');await directory.selectOption(options[0].value);await page.waitForTimeout(500);await expect(prev).toBeDisabled();await page.emulateMedia({reducedMotion:'reduce'});await directory.selectOption(options[mid].value);await expect.poll(()=>directory.inputValue()).toBe(options[mid].value);await snap('reduced-motion-directory');},
  '17': async()=>productHero('/zh/products/detail/box-furnace','zh',mobile),
  '18': async()=>productHero('/en/products/detail/rotary-hearth-furnace','en',mobile,true),
  '19': async()=>productHero('/zh/products/detail/box-furnace','zh',desktop,true),
  '20': async()=> {for(const l of ['zh','en']){await goto('/'+l+'/products/detail/box-furnace');const tables=page.locator('main table');const count=await tables.count();check('actual-product-tables',count>=2,count);let compareTable;for(let i=0;i<count;i++){const columns=await tables.nth(i).locator('tr').first().locator('th,td').count();if(columns>=5) compareTable=tables.nth(i);else if(columns===2){const cells=await tables.nth(i).locator('th,td').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),client:e.clientWidth,scroll:e.scrollWidth,whiteSpace:getComputedStyle(e).whiteSpace})));check('two-column-text-unclipped-'+l,cells.every(x=>x.scroll<=x.client+1),cells);}}assert(compareTable,'five-column-comparison-present');const container=compareTable.locator('..');await expose(container);const before=await compareTable.locator('tr').first().locator('th,td').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().x));await snap(l+'-table-before');await actualWheel(container,420,0);await expect.poll(()=>container.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);const after=await compareTable.locator('tr').first().locator('th,td').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().x));check('first-column-sticky-'+l,Math.abs(after[0]-before[0])<2 && after[1]<before[1]-20,{before,after});await snap(l+'-table-after');}},
  '21': async()=> {for(const l of ['zh','en']){await goto('/'+l+'/products/detail/box-furnace');const image=page.locator('[data-furnace-cutaway-image]');await expose(image);await expect.poll(()=>image.evaluate(e=>e.complete&&e.naturalWidth>0)).toBe(true);const figure=image.locator('xpath=ancestor::figure');check('one-localized-caption',await figure.locator('figcaption').count()===1);await snap(l+'-actual-structure');const link=figure.locator('a[target="_blank"]');const [tab]=await Promise.all([context.waitForEvent('page'),link.click()]);await tab.waitForLoadState('domcontentloaded');await tab.waitForFunction(()=>{const i=document.querySelector('img');return i?.complete&&i.naturalWidth>0});const actual=await tab.evaluate(()=>({url:location.href,width:document.querySelector('img').naturalWidth,height:document.querySelector('img').naturalHeight}));check('original-image-real-load-'+l,actual.width>0&&actual.height>0,actual);await tab.close();await page.bringToFront();assert.deepEqual(page.viewportSize(),mobile);await snap(l+'-returned390');}},
  '22': async()=> {for(const l of ['zh','en']){await goto('/'+l+'/news');const toggle=page.locator('button[aria-controls="news-filter-options"]');await expect(toggle).toHaveAttribute('aria-expanded','false');await snap(l+'-filters-collapsed');await click(toggle,'resource-filter-expand');await expect(toggle).toHaveAttribute('aria-expanded','true');const topic=page.locator('#news-filter-options a[href*="topic=selection"]').first();await click(topic,'equipment-selection-topic');await page.waitForURL(u=>u.searchParams.get('topic')==='selection');await expect(page.locator('[data-news-id]').first()).toBeVisible();const sort=page.locator('main a[href*="sort=recommended"]').first();await expect(sort).toHaveCount(1);await click(sort,'actual-sort-change-to-nondefault-recommended');await page.waitForURL(u=>u.searchParams.get('sort')==='recommended');await settle();await snap(l+'-topic-selected');const page2=page.getByRole('link',{name:l==='en'?'Next':'下一页',exact:true});await click(page2,'resource-page2');await page.waitForURL(u=>u.searchParams.get('page')==='2');await expect(page.locator('[data-news-id]').first()).toBeVisible();await settle();const expected=page.url();await snap(l+'-page2');if(await toggle.getAttribute('aria-expanded')==='true')await click(toggle,'resource-filter-collapse');const summary=await toggle.innerText();check('collapsed-summary-selected-'+l,/Equipment Selection|设备选型/.test(summary),summary);await page.goBack();await ready();await page.goForward();await page.waitForURL(expected);await ready();check('history-restores-scope-'+l,new URL(page.url()).searchParams.get('topic')==='selection'&&new URL(page.url()).searchParams.get('page')==='2');const h=await page.locator('main h1').count();check('one-news-heading-'+l,h===1,h);await expose(page.locator('#news-list-title'));const titleRect=await page.locator('#news-list-title').boundingBox(),headerRect=await siteHeaderBox();check('resource-title-below-sticky-header-'+l,titleRect.y>=headerRect.y+headerRect.height-2,{title:titleRect,header:headerRect});await snap(l+'-history-restored');await page.locator('[aria-controls="mobile-navigation-dialog"]').click();const link=page.locator('#mobile-navigation-dialog a[href="/'+l+'/news"]').first();await link.click();await page.waitForURL(u=>u.pathname==='/'+l+'/news'&&!u.searchParams.get('page'));await ready();await snap(l+'-header-news-return');await goto('/'+l+'/news',desktop);check('desktop-news-notblank-'+l,await page.locator('[data-news-id]').count()>0);await snap(l+'-desktop-news');}},
  'A1': async()=> {for(const [route,l] of [['/en/products','en'],['/en/contact','en'],['/zh/contact','zh']]) await dropdownLifecycle(route,l);},
  'B1': async()=> {for(const slug of ['custom-heat-treatment-furnace-chamber-process','annealing-furnace-metal-semiconductor-selection','steel-annealing-500-tonnes-two-bogie-hearth-furnaces-capacity']){for(const view of [mobile,desktop]){await goto('/zh/news/'+slug,view);const body=page.locator('[data-news-slug]');const result=await body.evaluate(e=>{const r=e.getBoundingClientRect();return {slug:e.dataset.newsSlug,visible:r.height>200,width:r.width,textLength:e.innerText.trim().length,paragraphs:e.querySelectorAll('p').length,headings:e.querySelectorAll('h2,h3').length}});check('article-visible-full-body-'+slug,result.visible&&result.textLength>1000&&result.paragraphs>5&&result.headings>0,result);await snap(slug+'-'+view.width);}}}
};
async function productHero(route,locale,view,anchor=false){await goto(route,view);const details=page.locator('main details').first();check('hero-conditions-default',await details.evaluate(e=>e.open)===(view.width===1440));const hero=page.locator('#overview');const quote=hero.locator('[data-product-scroll-variant="hero"]:visible');check('one-visible-hero-quote',await quote.count()===1,await quote.allTextContents());await snap('hero-initial');if(view.width===390){await click(details.locator('summary'),'conditions-expand');check('conditions-open',await details.evaluate(e=>e.open));await snap('conditions-expanded');}if(anchor){const links=page.locator('main nav a[href^="#"]');check('existing-section-links',await links.count()>0);const link=links.first();const href=await link.getAttribute('href');await click(link,'actual-section-anchor');const heading=page.locator(href);await page.waitForURL(u=>u.hash===href);await expect.poll(async()=>{const r=await heading.boundingBox(),h=await siteHeaderBox();return !!r&&r.y>=h.y+h.height-2&&r.y<view.height;}).toBe(true);await settle();const r=await heading.boundingBox(),h=await siteHeaderBox();check('section-below-header',r.y>=h.y+h.height-2,{section:r,header:h});await snap('section-anchor');}await click(quote.first(),'existing-hero-quote');await expect(page.locator(form)).toHaveCount(1);await settle();check('quote-reaches-existing-form',new URL(page.url()).hash==='#inquiry',page.url());check('quote-keeps-locale',new URL(page.url()).pathname.startsWith('/'+locale));await snap('quote-form');}

await (async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  let failed=0;
  try {
    for(const id of (cli['--cases']||Object.keys(cases).join(',')).split(',')){
      assert(cases[id],id);out=path.join(root,'browser',phase,plan.sourceCommit.slice(0,12),'supplemental',id,'attempt-'+(cli['--attempt']||'1'));freshOutput(out);
      const startedAtUtc=new Date().toISOString();log=[];checks=[];seq=0;const errors=[],consoleMessages=[],failedRequests=[];
      context=await browser.newContext({viewport:mobile});page=await context.newPage();page.setDefaultTimeout(15000);
      page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>consoleMessages.push({type:m.type(),message:m.text()}));
      page.on('requestfailed',r=>{let u;try{u=new URL(r.url())}catch{}failedRequests.push({host:u?.hostname,path:u?.pathname,error:r.failure()?.errorText});});
      await context.addInitScript(()=>{window.__releaseSafety={submits:0,submitClicks:0,preventedContactDefaults:[],events:[]};document.addEventListener('submit',e=>{window.__releaseSafety.submits++;e.preventDefault();e.stopImmediatePropagation()},true);document.addEventListener('click',e=>{const b=e.target.closest('button,input,a');if(b?.matches('button[type=submit],input[type=submit]')){window.__releaseSafety.submitClicks++;e.preventDefault();e.stopImmediatePropagation()}if(b?.matches('a')&&/^(tel:|mailto:|weixin:)/i.test(b.getAttribute('href')||'')){e.preventDefault();window.__releaseSafety.preventedContactDefaults.push({scheme:b.getAttribute('href').split(':')[0],prevented:e.defaultPrevented,trusted:e.isTrusted})}},true);for(const type of ['click','wheel','keydown'])document.addEventListener(type,e=>window.__releaseSafety.events.push({type,trusted:e.isTrusted,key:e.key,x:e.clientX,y:e.clientY,deltaX:e.deltaX,deltaY:e.deltaY,insideMenu:!!e.target.closest('[role=listbox]'),text:e.target.closest('button,a,[role=option]')?.textContent.trim().slice(0,120)}),true);});
      let error=null,safety=null;
      try{await cases[id]();safety=await page.evaluate(()=>window.__releaseSafety);check('no-lead-submission',safety.submits===0&&safety.submitClicks===0,safety);check('native-contact-defaults-prevented',safety.preventedContactDefaults.every(x=>x.prevented),safety.preventedContactDefaults);check('no-runtime-error',errors.length===0,errors);if(phase==='production')check('actual-production-QA-associated',await page.evaluate(()=>!!sessionStorage.getItem('suneng_session_id')&&sessionStorage.getItem('suneng_session_id')===sessionStorage.getItem('suneng_manual_qa_session_v1')));}
      catch(e){failed++;error=sanitize(String(e));try{await page.screenshot({path:path.join(out,'failure.png')});write(path.join(out,'failure.dom.json'),await page.evaluate(observe));safety=await page.evaluate(()=>window.__releaseSafety)}catch{}}
      write(path.join(out,'result.json'),{schemaVersion:1,phase,case:id,sourceCommit:plan.sourceCommit,runtimeImage:plan.runtimeImage,planSha256:sha(planRaw),identityBeforeSha256:sha(identityRaw),methodSha256:methodSha,startedAtUtc,finishedAtUtc:new Date().toISOString(),passed:!error&&checks.length>0&&checks.every(x=>x.passed),checks,actions:log,error,safety,consoleMessages,runtimeErrors:errors,failedRequests,limits:['Desktop Chrome at an actual narrow viewport. Physical phone touch not tested.','Real mouse wheel and keyboard events are used; DOM positioning is explicitly recorded separately.','No lead submit, outgoing call/message/mail, clipboard write, or image fault injection.']});
      await context.close();console.log(JSON.stringify({case:id,passed:!error,error}));
    }
  }finally{await browser.close()}
  assert.equal(sha(fs.readFileSync(path.join(root,'plan.json'))),sha(planRaw));assert.equal(sha(fs.readFileSync(identityPath)),sha(identityRaw));process.exitCode=failed?1:0;
})().catch(e=>{console.error(sanitize(String(e)));process.exitCode=1;});

}
module.exports={createActions,captureBudget,safeRoot,safeRead,freshOutput,observationSource,main};
if(require.main===module)main().catch(e=>{console.error(e.name);process.exitCode=1;});
