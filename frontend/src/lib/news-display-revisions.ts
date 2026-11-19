import revisions from './news-display-revisions.json';

const images: Record<string, string> = revisions.images;
const descriptions: Record<string, Record<string, string>> = revisions.alt;
const copy: Record<string, Partial<Record<string, Record<string, string>>>> = revisions.copy;

function localImagePath(value: string) {
  try {
    const url = new URL(value, 'https://www.jssngyl.cn');
    if (['https://www.jssngyl.cn', 'https://jssngyl.cn'].includes(url.origin) && !url.search && !url.hash) {
      return url.pathname;
    }
  } catch {
    // Leave unfamiliar or invalid addresses untouched.
  }
  return '';
}

export function reviewedNewsImage(value: string) {
  return images[localImagePath(value)] || value;
}

// Run only on rendered markup so publication eligibility and SEO titles continue
// to use the original, reviewed Chinese and English source.
export function applyNewsDisplayRevisions(root: HTMLElement, slug?: string, locale?: string) {
  if (!slug || !locale) return;
  if (locale === 'zh' && slug === 'bolt-mesh-belt-quench-temper-capability' && !root.querySelector('#bolt-furnace-selection')) {
    const section = root.ownerDocument.createElement('section');
    section.innerHTML = `<h2 id="bolt-furnace-selection">10.9 级螺栓对脱碳和力学性能要求严，网带炉和多用炉怎么选？</h2>
<p>先查两类能对回装炉批号的记录。一类看加热时的气氛控制和螺纹表面的检验结果，另一类看相同材料、代表直径的螺栓经淬火和回火后，硬度和力学性能是否达标。两种炉型都有相应验证时，再按批量、装法和换批频率选。</p>
<p><strong>螺纹表面看脱碳和增碳。</strong>苏能的一份紧固件连续调质线方案采用甲醇裂解保护气氛，用氧探头反馈调节碳势。碳势用纯铁试样在该温度下与炉气达到平衡时的含碳量表示。判断合金钢螺栓表面会吸碳还是失碳，还要考虑钢材成分。验收时，将同批的炉温、碳势记录与螺纹取样部位的脱碳和增碳检验结果对照。</p>
<p><strong>心部性能看钢材和直径。</strong>这份方案的配套螺栓图纸标注 8.8 级，采购要求列有 8.8、10.9、12.9 级。按方案所列螺栓规格和油淬条件核算，项目指定的 35 钢达不到 8.8 级所需的心部淬硬要求。对 10.9 级，图纸允许代用的铬钢能淬硬到多深，取决于具体炉号的淬透性。只有该炉号满足方案的淬透性要求，M22、M24 才列为可验证的设计目标。方案对 M27、M36 建议用淬透性更高的铬钼钢，对 M42 另列含镍的铬钼钢。具体规格能否达标，要用实际炉号的试件核对规定测点的硬度，以及适用的拉伸、保证载荷等试验结果。</p>
<p><strong>两种炉都能达标时，看工件怎么走。</strong>批量稳定、工艺相近，螺栓能均匀铺开、从上料到入淬都能顺利交接，可先比较网带炉。不同订单也可以分批连续生产，换批时应能分清工件和记录。苏能在上述方案中为长螺栓安排了定向摆料、专用导向和低落差交接。试线时，拿细长、容易弯的规格按量产装法走完全程，检查磕碰和交付状态的直线度。若频繁换工艺，或必须靠工装逐件定位、整筐转运，可优先比较按炉次处理的多用炉。</p>`;
    const firstHeading = root.querySelector('h2');
    if (firstHeading) firstHeading.before(section);
    else root.append(section);
  }
  if (locale === 'zh' && slug === 'gas-cylinder-curing-batch-oven-continuous-line-selection') {
    const href = '/zh/products/detail/cylinder-curing-line#workpieces';
    if (!root.querySelector(`a[href="${href}"]`)) {
      const paragraph = root.ownerDocument.createElement('p');
      const link = root.ownerDocument.createElement('a');
      link.setAttribute('href', href);
      link.textContent = '缠绕气瓶连续固化生产线适用哪些瓶型？';
      paragraph.append(link);
      const introduction = root.querySelector('p');
      if (introduction) introduction.after(paragraph);
      else root.prepend(paragraph);
    }
  }
  const terms = Object.entries(copy[slug]?.[locale] ?? {});
  function revise(text: string) {
    for (const [original, replacement] of terms) text = text.replaceAll(original, replacement);
    return text;
  }
  for (const image of root.querySelectorAll('img[src]')) {
    const src = image.getAttribute('src')!;
    const alt = image.getAttribute('alt');
    const alternatives = descriptions[localImagePath(src)];
    if (alt && alternatives && Object.hasOwn(alternatives, alt)) image.setAttribute('alt', alternatives[alt]);
    const revised = reviewedNewsImage(src);
    if (revised !== src) image.setAttribute('src', revised);
  }
  for (const link of root.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href')!;
    const revised = reviewedNewsImage(href);
    if (revised !== href) link.setAttribute('href', revised);
  }
  if (!terms.length) return;
  for (const node of root.querySelectorAll('[alt], [title], [aria-label]')) {
    for (const name of ['alt', 'title', 'aria-label']) {
      const value = node.getAttribute(name);
      if (value) node.setAttribute(name, revise(value));
    }
  }
  const walker = root.ownerDocument.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeValue) node.nodeValue = revise(node.nodeValue);
  }
}
