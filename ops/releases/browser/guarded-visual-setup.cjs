'use strict';
const path = require('node:path');
const {createRequire} = require('node:module');
const guard = require('./notification-guard.cjs');
module.exports = async () => {
  const frontend = path.resolve(process.env.SUNENG_QA_FRONTEND || process.cwd());
  const {chromium} = createRequire(path.join(frontend, 'package.json'))('@playwright/test');
  const browser = await guard.launch(chromium,{headless:true,channel:process.env.PLAYWRIGHT_BROWSER_CHANNEL});
  try {
    const context = await guard.newContext(browser);
    await context.close();
  } finally {await browser.close();}
};
