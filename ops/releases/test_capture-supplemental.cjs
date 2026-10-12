/* Local browser fixtures only; no production URL or business contact is opened. */
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const os=require('node:os');
const {createRequire}=require('node:module');
const {createActions,captureBudget,freshOutput,observationSource}=require('./capture-supplemental.cjs');
const packageJson=process.env.RELEASE_TEST_PACKAGE_JSON||path.resolve(__dirname,'../../frontend/package.json');
const {chromium}=createRequire(packageJson)('@playwright/test');
let browser;
before(async()=>{browser=await chromium.launch({channel:'chrome',headless:true});});
after(async()=>{await browser?.close();});

async function fixture(viewport,html,fn) {
  const context=await browser.newContext({viewport});const page=await context.newPage();
  try {
    await page.setContent(html);await page.waitForLoadState('load');
    const initial=await page.locator('body').evaluate(e=>({width:innerWidth,buttons:e.querySelectorAll('button').length}));
    assert.equal(initial.width,viewport.width);
    await fn(page);
  } finally {await context.close();}
}
function screenshotPath(name) {
  const folder=process.env.RELEASE_TEST_ARTIFACTS;
  if(!folder)return null;
  fs.mkdirSync(folder,{recursive:true});return path.join(folder,name+'.png');
}

test('workload budget retains three complete first opens',()=>{
  assert.equal(captureBudget(),180000);
  assert.throws(()=>captureBudget(25));assert.throws(()=>captureBudget(3,0));
});

test('existing evidence directory is refused rather than overwritten',()=>{
  const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'release-capture-test-')));
  try {
    const folder=freshOutput(path.join(root,'captures','attempt-1'));
    fs.writeFileSync(path.join(folder,'original.txt'),'retain');
    assert.throws(()=>freshOutput(folder));
    assert.equal(fs.readFileSync(path.join(folder,'original.txt'),'utf8'),'retain');
  } finally {fs.rmSync(root,{recursive:true});}
});

test('fixed observation is self contained and needs no earlier batch script',async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();
  try {
    await page.route('http://127.0.0.1/**',route=>route.fulfill({contentType:'text/html',
      body:'<main><h1>Local fixture</h1><form data-contact-form><input name="phone"></form></main>'}));
    await page.goto('http://127.0.0.1/fixture');await page.waitForLoadState('load');
    const seen=await page.evaluate(observationSource);
    assert.equal(seen.viewport.width,390);assert.equal(seen.forms.length,1);
  } finally {await context.close();}
});

for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
  test('real visible click with hidden duplicate at '+viewport.width,async()=>{
    await fixture(viewport,'<button style="display:none">Next</button><button id="visible">Next</button>'+
      '<script>window.clicked=0;document.getElementById("visible").onclick=e=>{window.clicked++;window.trusted=e.isTrusted}</script>',async page=>{
      const r=await createActions(page,{timeoutMs:1500,stableMs:50}).click(page.getByRole('button',{name:'Next',includeHidden:true}));
      assert(r.centerHit);assert.equal(await page.evaluate(()=>window.clicked),1);
      assert.equal(await page.evaluate(()=>window.trusted),true);
      const output=screenshotPath('visible-'+viewport.width);if(output)await page.screenshot({path:output});
    });
  });
}

test('two visible matches are rejected without a click',async()=>{
  await fixture({width:390,height:844},'<button>Next</button><button>Next</button>'+
    '<script>window.clicked=0;document.onclick=()=>window.clicked++</script>',async page=>{
    await assert.rejects(createActions(page,{timeoutMs:500,stableMs:50}).click(page.getByRole('button',{name:'Next'})),/not unique/);
    assert.equal(await page.evaluate(()=>window.clicked),0);
  });
});

test('phone bottom overlay cannot be treated as a successful click',async()=>{
  await fixture({width:390,height:844},'<button style="position:fixed;bottom:10px;left:40px;height:50px">Target</button>'+
    '<div style="position:fixed;bottom:0;left:0;width:100%;height:100px;z-index:9;background:#ddd"></div>'+
    '<script>window.clicked=0;document.querySelector("button").onclick=()=>window.clicked++</script>',async page=>{
    await assert.rejects(createActions(page,{timeoutMs:300,stableMs:50}).click(page.getByRole('button',{name:'Target'})));
    assert.equal(await page.evaluate(()=>window.clicked),0);
    const output=screenshotPath('blocked-phone');if(output)await page.screenshot({path:output});
  });
});

test('offscreen target is scrolled, settled, then clicked with a trusted event',async()=>{
  await fixture({width:390,height:844},'<div style="height:1800px"></div><button id="target">Target</button>'+
    '<script>window.clicked=0;document.getElementById("target").onclick=e=>{window.clicked++;window.trusted=e.isTrusted}</script>',async page=>{
    await createActions(page,{timeoutMs:1500,stableMs:50}).click(page.getByRole('button',{name:'Target'}));
    assert.equal(await page.evaluate(()=>window.clicked),1);assert.equal(await page.evaluate(()=>window.trusted),true);
    assert(await page.evaluate(()=>scrollY)>0);
    const output=screenshotPath('scrolled-phone');if(output)await page.screenshot({path:output});
  });
});
