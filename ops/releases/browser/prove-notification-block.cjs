'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {createRequire} = require('node:module');
const {resolve} = require('node:path');
const guard = require('./notification-guard.cjs');

async function main() {
  const [worktree, filename, marker] = process.argv.slice(2);
  assert(worktree && filename && /^[A-Za-z0-9_-]{1,80}$/.test(marker), 'Specify workspace, new receipt and QA marker');
  const {chromium} = createRequire(resolve(worktree, 'frontend/package.json'))('@playwright/test');
  const origin = 'https://www.jssngyl.cn';
  const article = origin + '/zh/news/bolts-nuts-shared-heat-treatment-line-loading-transfer';
  const domain = 'zhanzhang.toutiao.com';
  const attempts = [], blocked = [], failures = [], responses = [], completed = [];
  const seen = req => {
    const url = new URL(req.url());
    return url.hostname === domain && url.pathname === '/s.gif';
  };
  const browser = await guard.launch(chromium, {channel:'chrome',headless:true});
  let passed = false;
  const started = new Date().toISOString();
  try {
    const context = await guard.newContext(browser, {viewport:{width:1440,height:900}}, entry => blocked.push(entry));
    const page = await context.newPage();
    page.on('request', req => {if(seen(req)) attempts.push({time:new Date().toISOString(),article:req.frame().url().split('?')[0]});});
    page.on('requestfinished', req => {if(seen(req)) completed.push(new Date().toISOString());});
    page.on('requestfailed', req => {if(seen(req)) failures.push(req.failure()?.errorText || 'unknown');});
    page.on('response', res => {if(seen(res.request())) responses.push(res.status());});
    await page.goto(origin+'/zh?acquisition_qa='+encodeURIComponent(marker), {waitUntil:'domcontentloaded',timeout:60000});
    const realIdentity = () => !!sessionStorage.getItem('suneng_session_id') &&
       sessionStorage.getItem('suneng_session_id') === sessionStorage.getItem('suneng_manual_qa_session_v1');
    await page.waitForFunction(realIdentity,null,{timeout:30000});
    const aborted = page.waitForEvent('requestfailed',{predicate:seen, timeout:45000});
    // Observe the promise even when the navigation itself fails.
    const result = await Promise.all([aborted, page.goto(article,{waitUntil:'domcontentloaded',timeout:60000})]);
    assert.equal(result[1].status(),200);
    await page.locator('main h1').waitFor({state:'visible'});
    assert.equal(page.url(),article);
    assert(await page.evaluate(realIdentity));
    const exact = blocked.filter(e=>e.domain===domain && e.path==='/s.gif');
    assert(attempts.length>=1 && attempts.every(e=>e.article===article));
    assert.equal(exact.length,attempts.length);
    assert.equal(failures.length,attempts.length);
    assert(failures.every(reason=>reason.includes('BLOCKED_BY_CLIENT')));
    assert.equal(responses.length,0);
    assert.equal(completed.length,0);
    await guard.checkService(guard.config());
    passed = true;
    await context.close();
  } finally {
    await browser.close();
    fs.writeFileSync(filename,JSON.stringify({article,domain,started,finished:new Date().toISOString(),passed,
      attempts,blocked,failures,responses,completed,method:'browser request-level abort, independent loopback refusal and DNS block'},null,2)+'\n',{flag:'wx'});
  }
}
main().catch(error=>{console.error(String(error.message).replace(/(https?:\/\/[^?\s]+)\?[^\s]+/g,'$1 [query omitted]'));process.exitCode=1;});
