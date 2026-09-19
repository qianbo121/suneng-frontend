(async () => {
  // The release tool passes the case rules; without them the check fails closed.
  const contract = JSON.parse(process.env.RELEASE_CASE_CONTRACT);
  const allowed = { open: [200], closed: [404], either: [200, 404] }[contract.state];
  if (!allowed) throw new Error('unknown case state');
  const base = process.env.RELEASE_CHECK_BASE || 'http://127.0.0.1:3000';
  const status = async (path) => (await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(15000) })).status;
  const live = ['/zh','/en','/zh/news','/en/news','/zh/products','/en/products','/zh/about','/en/about','/zh/inquiry','/en/contact'];
  const fixedChecks = [];
  for (const [path, expected] of [...live.map((p) => [p, 200]), ...contract.retired.map((p) => [p, 404])])
    fixedChecks.push({ path, status: await status(path), expected });
  const statuses = {};
  const caseChecks = [];
  for (const path of contract.group) {
    statuses[path] = await status(path);
    caseChecks.push({ path, status: statuses[path], expected: allowed.join('|') });
  }
  const hub = (path) => path.split('/').slice(0, 3).join('/');
  const casesPassed = contract.group.every((path) => allowed.includes(statuses[path]))
    // A case page is never public while its locale's hub is withdrawn.
    && contract.group.every((path) => path === hub(path) || statuses[path] !== 200 || statuses[hub(path)] === 200);
  const guides = contract.guides || {state: 'open', paths: []};
  const guideAllowed = guides.state === 'open' ? [200] : guides.state === 'either' ? [200, 404] : [];
  const guideChecks = [];
  for (const path of guides.paths) {
    statuses[path] = await status(path);
    guideChecks.push({path, status: statuses[path], expected: guideAllowed.join('|')});
  }
  const guidesPassed = guideChecks.every((check) => guideAllowed.includes(check.status));
  const sitemap = await fetch(base + '/sitemap.xml', { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  const xml = await sitemap.text();
  const decode = (value) => value.replace(/&amp;/g, '&');
  const located = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1]));
  const alternates = [...xml.matchAll(/<xhtml:link\b[^>]*\bhref="([^"]*)"/g)].map((m) => decode(m[1]));
  const paths = new Set(located.map((u) => new URL(u, 'http://local').pathname));
  const caseUrlPasses = (u) => {
    const url = new URL(u, 'http://local');
    if (/\/(articles|solutions)(\/|$)/.test(url.pathname)) return !url.search && guides.paths.includes(url.pathname) && statuses[url.pathname] === 200;
    if (!/\/case(\/|$)/.test(url.pathname)) return true;
    return !url.search && contract.group.includes(url.pathname) && statuses[url.pathname] === 200;
  };
  const sitemapPassed = sitemap.status === 200 && paths.has('/zh/news') && paths.has('/en/news')
    && [...located, ...alternates].every(caseUrlPasses)
    && (contract.state !== 'open' || contract.group.every((path) => paths.has(path)))
    && guides.paths.every((path) => statuses[path] !== 200 || paths.has(path));
  const passed = fixedChecks.every((c) => c.status === c.expected) && casesPassed && guidesPassed && sitemapPassed;
  console.log(JSON.stringify({ passed, checks: [...fixedChecks, ...caseChecks, ...guideChecks], sitemapPassed, caseState: contract.state, notificationSent: false, inquirySubmitted: false }));
  process.exit(passed ? 0 : 1);
})().catch(() => { console.error('Release route check failed; no response body or credentials logged.'); process.exit(1); });
