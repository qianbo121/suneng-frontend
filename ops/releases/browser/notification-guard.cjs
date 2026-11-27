'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');

function config() {
  const filename = process.env.SUNENG_QA_NOTIFICATION_GUARD;
  assert(filename, 'Missing release browser notification guard');
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}
async function checkService(c) {
  const response = await fetch(c.local + '/health', {signal: AbortSignal.timeout(3000)});
  assert(response.ok && await response.text() === c.nonce, 'Release notification guard lost');
}
async function launch(chromium, options = {}) {
  const c = config();
  await checkService(c);
  return chromium.launch({...options, args: [...(options.args || []), ...c.launchArgs]});
}
async function newContext(browser, options = {}, onBlocked = () => {}) {
  const c = config();
  await checkService(c);
  const context = await browser.newContext({...options, serviceWorkers:'block'});
  try {
    const probe = await context.newPage();
    const response = await probe.goto('http://' + c.probeHost + '/probe', {timeout:8000});
    assert(response && response.ok() && (await response.text()) === c.nonce,
      'Browser did not prove local interception before navigation');
    const denied = await probe.goto('http://' + c.denyProbe + '/deny', {timeout:8000});
    assert(denied && denied.status() === 403 && (await denied.text()) === 'release-denied-' + c.nonce,
      'Missing local refusal before navigation');
    await probe.close();
    let routeCanary = false;
    const protectedHost = url => [c.denyProbe, 'zhanzhang.toutiao.com'].includes(url.hostname.toLowerCase().replace(/\.$/, ''));
    await context.route(protectedHost, async route => {
      const url = new URL(route.request().url());
      await route.abort('blockedbyclient');
      // Only host and path are retained. The query can contain the publisher credential.
      if (url.hostname === c.denyProbe) routeCanary = true;
      else onBlocked({at:new Date().toISOString(), domain:url.hostname, path:url.pathname});
    });
    const localRuleTest = await context.newPage();
    let blockedByClient = false;
    try {
      await localRuleTest.goto('http://' + c.denyProbe + '/route-check', {timeout:8000});
    } catch (error) {
      blockedByClient = String(error.message).includes('BLOCKED_BY_CLIENT');
    }
    await localRuleTest.close();
    assert(routeCanary && blockedByClient, 'Missing browser request rule; stopped before site navigation');
    // A lost guard aborts the operation, including an in-flight interaction or a popup.
    const timer = setInterval(() => checkService(c).catch(() => context.close().catch(() => {})), 1000);
    timer.unref();
    context.once('close', () => clearInterval(timer));
    return context;
  } catch (error) {
    await context.close();
    throw error;
  }
}
module.exports = {launch, newContext, checkService, config};
