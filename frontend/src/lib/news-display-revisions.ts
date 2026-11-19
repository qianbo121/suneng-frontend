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
