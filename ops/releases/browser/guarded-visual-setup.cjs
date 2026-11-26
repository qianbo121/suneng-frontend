'use strict';
const path = require('node:path');
const fs = require('node:fs');
const {createRequire} = require('node:module');
const guard = require('./notification-guard.cjs');
module.exports = async () => {
  const frontend = path.resolve(process.env.SUNENG_QA_FRONTEND || process.cwd());
  // Every visual spec, including manually created contexts, must use the guarded browser fixture.
  const visualDir = path.join(frontend, 'tests/visual');
  for (const spec of fs.readdirSync(visualDir, {recursive:true}).filter(file => /\.spec\.[cm]?[jt]sx?$/.test(file))) {
    const source = fs.readFileSync(path.join(visualDir,spec), 'utf8');
    if (!/from ['"]\.\/fixtures\/release-test['"]/.test(source) || /from ['"]@playwright\/test['"]/.test(source)) {
      throw new Error('Missing release browser fixture in ' + spec);
    }
  }
  const {chromium} = createRequire(path.join(frontend, 'package.json'))('@playwright/test');
  const browser = await guard.launch(chromium,{headless:true,channel:process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'chromium'});
  try {
    const context = await guard.newContext(browser);
    await context.close();
  } finally {await browser.close();}
};
