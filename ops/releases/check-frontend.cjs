(async () => {
  const live = ['/zh','/en','/zh/news','/en/news','/zh/products','/en/products','/zh/about','/en/about','/zh/inquiry','/en/contact'];
  const retired = ['/zh/case','/en/case','/zh/solutions','/en/solutions','/zh/articles/gongye-lu-baojia-canshu','/zh/case/alloy-eight-furnaces-acceptance-supply-boundaries-proposal'];
  const checks=[];
  for (const [path, expected] of [...live.map(p=>[p,200]),...retired.map(p=>[p,404])]) {
    const response=await fetch('http://127.0.0.1:3000'+path,{redirect:'manual',signal:AbortSignal.timeout(15000)});
    checks.push({path,status:response.status,expected});
  }
  const sitemap=await fetch('http://127.0.0.1:3000/sitemap.xml',{redirect:'manual',signal:AbortSignal.timeout(15000)});
  const xml=await sitemap.text();
  const locations=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
  const sitemapPassed=sitemap.status===200 && locations.some(u=>u.endsWith('/zh/news')) && locations.some(u=>u.endsWith('/en/news')) && !locations.some(u=>/\/(case|articles|solutions)(\/|\?|$)/.test(u));
  const passed=checks.every(c=>c.status===c.expected)&&sitemapPassed;
  console.log(JSON.stringify({passed,checks,sitemapPassed,notificationSent:false,inquirySubmitted:false}));
  process.exit(passed?0:1);
})().catch(()=>{console.error('Release route check failed; no response body or credentials logged.');process.exit(1)});
