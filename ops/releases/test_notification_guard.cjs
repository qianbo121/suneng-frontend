'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const {once} = require('node:events');
const {createRequire} = require('node:module');
const guard = require('./browser/notification-guard.cjs');
const {chromium} = createRequire(path.resolve(process.argv[2],'frontend/package.json'))('@playwright/test');
async function run() {
  const saved = process.env.SUNENG_QA_NOTIFICATION_GUARD;
  const config = guard.config();
  const browser = await guard.launch(chromium,{channel:'chrome',headless:true});
  try {
    for (const width of [1440,390]) {
      const ctx = await guard.newContext(browser,{viewport:{width,height:840}});
      const page = await ctx.newPage();
      await page.goto('data:text/html,<h1>Local fixture</h1>');
      assert.equal(await page.locator('h1').innerText(),'Local fixture');
      await ctx.close();
    }
    // The browser still talks to its real sink. Only its heartbeat becomes unavailable.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(),'release-guard-test-'));
    const control = http.createServer((_req,res)=>res.end(config.nonce));
    try {
      control.listen(0,'127.0.0.1'); await once(control,'listening');
      const file=path.join(dir,'control.json');
      fs.writeFileSync(file, JSON.stringify({...config,local:'http://127.0.0.1:'+control.address().port}));
      process.env.SUNENG_QA_NOTIFICATION_GUARD=file;
      const ctx = await guard.newContext(browser);
      const closed = once(ctx,'close');
      control.close(); control.closeAllConnections();
      let deadline;
      try {await Promise.race([closed,new Promise((_,reject)=>{deadline=setTimeout(()=>reject(Error('lost guard did not stop live context')),6000);})]);}
      finally {clearTimeout(deadline);}
    } finally {
      process.env.SUNENG_QA_NOTIFICATION_GUARD=saved;
      if(control.listening) control.close();
      fs.rmSync(dir,{recursive:true,force:true});
    }
  } finally {await browser.close();}
  const plain = await chromium.launch({channel:'chrome',headless:true,args:['--no-proxy-server','--host-resolver-rules=MAP *.invalid ~NOTFOUND']});
  try {await assert.rejects(()=>guard.newContext(plain),/ERR_|prove local interception|Timeout/);}
  finally {await plain.close();}
  console.log('PASS protected desktop and mobile; missing guard stopped before site navigation; losing the guard closed the context.');
}
run().catch(e=>{console.error(e.message);process.exitCode=1;});
