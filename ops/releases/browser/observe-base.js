// EXPECTATION and CONTRACT are supplied by the frozen plan, never page content.
(() => {
  const normalize = s => String(s || '').replace(/\s+/g, ' ').trim();
  const rect = element => {
    if (!element) return null;
    const r = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { x:r.x, y:r.y, width:r.width, height:r.height,
      display:style.display, visibility:style.visibility, opacity:style.opacity,
      fontSize:style.fontSize, lineHeight:style.lineHeight,
      clientWidth:element.clientWidth, scrollWidth:element.scrollWidth,
      clientHeight:element.clientHeight, scrollHeight:element.scrollHeight };
  };
  const shown = element => {
    const r = rect(element);
    return !!r && r.width > 0 && r.height > 0 && r.display !== 'none'
      && r.visibility !== 'hidden' && Number(r.opacity) > 0;
  };
  const pathOf = element => { const url = new URL(element.href, location.href); return url.origin === location.origin ? url.pathname : ''; };
  const heading = document.querySelector('main h1,h1');
  const main = document.querySelector('main');
  const h1 = normalize(heading?.innerText);
  const documentWidth = document.documentElement.scrollWidth;
  const assertions = {
    headingRendered: shown(heading) && h1.length > 0,
    mainContentRendered: shown(main) && normalize(main?.innerText).length > 200,
    pageWidthFitsViewport: documentWidth <= innerWidth + 1,
  };
  const measurements = { heading:rect(heading), main:rect(main), h1,
    documentWidth, innerWidth, innerHeight };
  const details = EXPECTATION.assertionDetails;
  if (details.kind === 'article') {
    const expected = details.expected;
    const section = document.querySelector('[aria-labelledby="news-related-links-title"]');
    const cards = Array.from(section?.querySelectorAll('a') || [])
      .filter(a => a.querySelector('h3'));
    const actual = cards.map(a => ({href:pathOf(a),
      title:normalize(a.querySelector('h3')?.innerText),
      description:normalize(a.querySelector('p')?.innerText), rect:rect(a),
      texts:Array.from(a.querySelectorAll('h3,p')).map(e=>({text:normalize(e.innerText),rect:rect(e)}))}));
    const exactNew = expected.cards.every((card,i) => actual[i]?.href === card.href
      && actual[i]?.title === normalize(card.title)
      && actual[i]?.description === normalize(card.description));
    const expectedPaths = [...expected.cards.map(c=>c.href), expected.quoteGuide];
    const paths = actual.map(c=>c.href);
    const inquiry = Array.from(section?.querySelectorAll('a') || [])
      .find(a => pathOf(a) === expected.consultationHref
        && normalize(a.innerText) === normalize(expected.consultationText));
    assertions.articleHeadingMatches = h1 === normalize(expected.title);
    assertions.approvedEquipmentCardsMatch = exactNew && actual.length === expectedPaths.length;
    assertions.approvedEquipmentCardsBeforeQuote = JSON.stringify(paths) === JSON.stringify(expectedPaths);
    assertions.quoteGuidePreserved = paths.at(-1) === expected.quoteGuide;
    assertions.projectInquiryPreserved = shown(inquiry);
    assertions.relatedDestinationsAllowed = paths.length === expectedPaths.length
      && paths.every(p=>expectedPaths.includes(p) && p!==location.pathname);
    assertions.cardTextNotClipped = actual.length>0 && actual.every(c=>
      c.texts.every(t=>t.text.length>0 && t.rect.scrollWidth<=t.rect.clientWidth+1
        && t.rect.scrollHeight<=t.rect.clientHeight+1));
    measurements.relatedCards = actual;
    measurements.inquiry = inquiry ? {path:pathOf(inquiry),text:normalize(inquiry.innerText),rect:rect(inquiry)} : null;
    if (section) section.scrollIntoView({block:'center',behavior:'instant'});
  } else if (details.kind === 'trolley') {
    const links = details.resources.map(expected => {
      const matches = Array.from(document.querySelectorAll('main a[href]'))
        .filter(a=>pathOf(a)===expected.path && normalize(a.querySelector('strong')?.innerText)===normalize(expected.title));
      return {expected, actualTitle:normalize(matches[0]?.querySelector('strong')?.innerText), count:matches.length, rendered:shown(matches[0]), rect:rect(matches[0])};
    });
    assertions.productHeadingMatches = h1.includes(details.headingContains);
    assertions.threeProcurementLinksMatch = links.length===3 && links.every(a=>a.count===1 && a.rendered);
    assertions.procurementLinksUseEnglishPaths = links.every(a=>a.expected.path.startsWith('/en/'))
      && links.every(a=>a.count===1);
    measurements.procurementLinks = links;
    const last = Array.from(document.querySelectorAll('main a[href]'))
      .find(a=>pathOf(a)===details.resources.at(-1).path);
    if (last) last.scrollIntoView({block:'center',behavior:'instant'});
  } else if (details.kind === 'roller') {
    const exact = Array.from(document.querySelectorAll('main *'))
      .filter(e=>normalize(e.innerText)===normalize(details.speedText))
      .sort((a,b)=>a.querySelectorAll('*').length-b.querySelectorAll('*').length)[0];
    assertions.productHeadingMatches = h1.includes(details.headingContains);
    assertions.speedConditionsExact = !!exact;
    assertions.speedConditionsRendered = shown(exact);
    measurements.speed = exact ? {text:normalize(exact.innerText),rect:rect(exact)} : null;
    if (exact) exact.scrollIntoView({block:'center',behavior:'instant'});
  } else if (details.kind === 'news') {
    const input = document.querySelector('#news-center-search');
    const label = document.querySelector('label[for="news-center-search"]');
    const results = Array.from(document.querySelectorAll('main a[href]'))
      .filter(a=>pathOf(a).startsWith('/en/news/') && normalize(a.innerText).length>0 && shown(a));
    assertions.newsHeadingMatches = h1===details.heading;
    assertions.searchInputLabelled = shown(input) && normalize(label?.textContent)===details.inputLabel;
    assertions.articleResultsRendered = results.length>0;
    measurements.search = {input:rect(input),label:normalize(label?.textContent),results:results.map(a=>({path:pathOf(a),text:normalize(a.innerText),rect:rect(a)}))};
  } else if (details.kind === 'procurement') {
    const body = document.querySelector(details.bodySelector);
    const sections = details.anchors.map(id=>({id,rect:rect(document.getElementById(id)),
      rendered:shown(document.getElementById(id)),heading:normalize(document.getElementById(id)?.querySelector('h2')?.innerText)}));
    const inquiry = Array.from(body?.querySelectorAll('a[href]') || [])
      .find(a=>pathOf(a)==='/zh/inquiry' && normalize(a.innerText)===details.inquiryText);
    assertions.procurementHeadingMatches = h1===details.heading;
    assertions.procurementSectionsPresent = shown(body) && sections.every(s=>s.rendered && s.heading.length>0);
    assertions.procurementInquiryPreserved = shown(inquiry);
    measurements.procurement = {body:rect(body),sections,inquiry:rect(inquiry)};
  } else if (details.kind === 'home') {
    const header = document.querySelector('header');
    const mobileMenu = header?.querySelector('[aria-controls="mobile-navigation-dialog"]');
    const links = Array.from(header?.querySelectorAll('.site-header__nav-link') || []).filter(shown);
    const sessionId = sessionStorage.getItem('suneng_session_id');
    const qaSession = sessionStorage.getItem('suneng_manual_qa_session_v1');
    assertions.primaryNavigationRendered = shown(header) && (shown(mobileMenu) || links.length>=3);
    assertions.ordinaryUrlNoQuery = location.search==='' && location.hash==='';
    assertions.qaSessionMatches = !!sessionId && !!qaSession && sessionId===qaSession;
    assertions.localPreviewTrackingSuppressed = location.hostname==='127.0.0.1' && sessionId===null && qaSession===null;
    measurements.qa = {sessionId,qaSession,keys:['suneng_session_id','suneng_manual_qa_session_v1']};
    measurements.navigation = {header:rect(header),mobileMenu:rect(mobileMenu),visiblePrimaryLinks:links.length};
  }
  const selected = Object.fromEntries(CONTRACT.assertions.map(name=>[name,assertions[name]===true]));
  const sessionId = sessionStorage.getItem('suneng_session_id');
  const qaSession = sessionStorage.getItem('suneng_manual_qa_session_v1');
  const localPreviewTrackingSuppressed = location.hostname==='127.0.0.1' && sessionId===null && qaSession===null;
  measurements.qa = {hostname:location.hostname,sessionId,qaSession,localPreviewTrackingSuppressed,keys:['suneng_session_id','suneng_manual_qa_session_v1']};
  return {method:'real-browser', viewport:{width:innerWidth,height:innerHeight},
    rendered:assertions.headingRendered && assertions.mainContentRendered,
    overflow:documentWidth>innerWidth+1,url:location.href,at:new Date().toISOString(),
    assertions:selected,localPreviewTrackingSuppressed,qaSessionMatches:!!sessionId && !!qaSession && sessionId===qaSession,
    observations:measurements};
})()
