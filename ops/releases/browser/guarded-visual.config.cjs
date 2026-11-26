'use strict';
const path = require('node:path');
const guard = require('./notification-guard.cjs');
const frontend = path.resolve(process.env.SUNENG_QA_FRONTEND || process.cwd());
const source = require(path.join(frontend,'playwright.visual.config.ts'));
const original = source.default || source;
const config = guard.config();
if (process.env.PW_TEST_REUSE_CONTEXT) throw new Error('Release visual tests require fresh guarded contexts');
process.env.SUNENG_QA_VISUAL_GUARD_REQUIRED = '1';
process.env.SUNENG_QA_VISUAL_GUARD_MODULE = require.resolve('./notification-guard.cjs');
module.exports = {...original, testDir:path.resolve(frontend,original.testDir),
  outputDir:path.resolve(frontend,original.outputDir),
  reporter:original.reporter.map(([name, opts])=>opts?.outputFolder
    ? [name,{...opts,outputFolder:path.resolve(frontend,opts.outputFolder)}] : (opts?[name,opts]:[name])),
  globalSetup:require.resolve('./guarded-visual-setup.cjs'),
  webServer:original.webServer?.map(server=>({...server,cwd:frontend})),
  use:{...original.use,channel:process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'chromium',reuseContext:false,serviceWorkers:'block',
       launchOptions:{...original.use.launchOptions,args:[...(original.use.launchOptions?.args || []),...config.launchArgs]}}};
