'use strict';
const path = require('node:path');
const guard = require('./notification-guard.cjs');
const frontend = path.resolve(process.env.SUNENG_QA_FRONTEND || process.cwd());
const source = require(path.join(frontend,'playwright.visual.config.ts'));
const original = source.default || source;
const config = guard.config();
module.exports = {...original, testDir:path.resolve(frontend,original.testDir),
  outputDir:path.resolve(frontend,original.outputDir),
  reporter:original.reporter.map(([name, opts])=>opts?.outputFolder
    ? [name,{...opts,outputFolder:path.resolve(frontend,opts.outputFolder)}] : (opts?[name,opts]:[name])),
  globalSetup:require.resolve('./guarded-visual-setup.cjs'),
  webServer:original.webServer?.map(server=>({...server,cwd:frontend})),
  use:{...original.use,serviceWorkers:'block',
       launchOptions:{...original.use.launchOptions,args:[...(original.use.launchOptions?.args || []),...config.launchArgs]}}};
