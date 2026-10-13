const PHONE_SOURCE = String.raw`(?:\+\s*86[\s\-–—−]*)?130[\s\-–—−]*5298[\s\-–—−]*6814`;
const EMAIL_SOURCE = String.raw`997518512\s*@\s*qq\.com`;
const PHONE_LABEL = String.raw`(?:苏能)?(?:公开)?(?:咨询|联系)?电话\s*[:：]?\s*`;
const EMAIL_LABEL = String.raw`(?:公开|官方|技术咨询)?邮箱\s*[:：]?\s*`;
const EXCLUDED = 'table, pre, code, figure, figcaption, h1, h2, h3, h4, h5, h6';
const BLOCKS = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'TABLE', 'PRE', 'FIGURE', 'FIGCAPTION', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'IMG', 'HR']);
const SEPARATORS = /^[\s；;，,。.!！|｜、]+|[\s；;，,。.!！|｜、]+$/g;

type Edit = { start: number; end: number; replacement: string };
type TextPart = { node: Node; start: number; end: number };

function textIndex(root: HTMLElement) {
  const parts: TextPart[] = [];
  let text = '';
  function visit(node: Node) {
    if (node.nodeType === 3 || node.nodeName === 'BR') {
      const value = node.nodeName === 'BR' ? '\n' : node.textContent || '';
      parts.push({ node, start: text.length, end: text.length + value.length });
      text += value;
    } else {
      Array.from(node.childNodes).forEach(visit);
    }
  }
  visit(root);
  return { text, parts };
}

function slice(root: HTMLElement, parts: TextPart[], start: number, end: number) {
  const range = root.ownerDocument.createRange();
  range.selectNodeContents(root);
  function boundary(index: number, isEnd: boolean) {
    const part = parts.find((item) => isEnd ? item.start < index && index <= item.end : item.start <= index && index < item.end);
    if (!part) return;
    if (part.node.nodeName === 'BR') {
      if (isEnd) range.setEndAfter(part.node);
      else range.setStartBefore(part.node);
    } else {
      const offset = index - part.start;
      const atEdge = isEnd ? offset === (part.node.textContent || '').length : offset === 0;
      let edge = part.node;
      if (atEdge) {
        while (edge.parentNode && edge.parentNode !== root && !(isEnd ? edge.nextSibling : edge.previousSibling)) edge = edge.parentNode;
        if (isEnd) range.setEndAfter(edge);
        else range.setStartBefore(edge);
      } else if (isEnd) range.setEnd(part.node, offset);
      else range.setStart(part.node, offset);
    }
  }
  boundary(start, false);
  boundary(end, true);
  return range.cloneContents();
}

// Keep the author's existing tel/mailto links and formatting around each value.
function valueFragment(root: HTMLElement, parts: TextPart[], match: RegExpMatchArray) {
  const start = match.index!;
  const part = parts.find((item) => item.start <= start && start < item.end);
  let wrapper = part?.node.parentElement;
  let selected: Element | undefined;
  while (wrapper && wrapper !== root) {
    if ((wrapper.textContent || '').trim() !== match[0].trim()) break;
    selected = wrapper;
    wrapper = wrapper.parentElement;
  }
  const fragment = root.ownerDocument.createDocumentFragment();
  if (selected) fragment.append(selected.cloneNode(true));
  else fragment.append(slice(root, parts, start, start + match[0].length));
  return fragment;
}

function labelBefore(text: string, index: number, source: string, fallback: string) {
  const match = text.slice(0, index).match(new RegExp(`(${source})$`));
  return match ? match[1].trim().replace(/\s*[:：]?\s*$/, '：') : fallback;
}

function pureContact(text: string) {
  return text
    .replace(new RegExp(`${PHONE_LABEL}${PHONE_SOURCE}`, 'g'), '')
    .replace(new RegExp(`${EMAIL_LABEL}${EMAIL_SOURCE}`, 'g'), '')
    .replace(new RegExp(PHONE_SOURCE, 'g'), '')
    .replace(new RegExp(EMAIL_SOURCE, 'g'), '')
    .replace(SEPARATORS, '') === '';
}

function narrativeEdits(text: string): Edit[] {
  const edits: Edit[] = [];
  function replace(source: string, replacement: string) {
    const match = text.match(new RegExp(source));
    if (match) edits.push({ start: match.index!, end: match.index! + match[0].length, replacement });
  }
  // These are the contact clauses actually used in the reviewed Chinese articles.
  // Limit prose changes to those clauses; retain the surrounding engineering copy.
  replace(`咨询时可将上述资料发送至\\s*${EMAIL_SOURCE}，或拨打\\s*${PHONE_SOURCE}，`, '咨询时可提供上述资料，');
  replace(`，可致电\\s*${PHONE_SOURCE}，或发送至\\s*${EMAIL_SOURCE}，`, '，');
  replace(`可致电\\s*${PHONE_SOURCE}，或发送资料至\\s*${EMAIL_SOURCE}。`, '');
  replace(`可发送至\\s*${EMAIL_SOURCE}，或致电\\s*${PHONE_SOURCE}\\s*进行项目沟通。`, '可据此进行项目沟通。');
  replace(`可发送至\\s*${EMAIL_SOURCE}，或致电\\s*${PHONE_SOURCE}。`, '');
  replace(`，发送至\\s*${EMAIL_SOURCE}；也可致电\\s*${PHONE_SOURCE}，`, '，');
  replace(`发送至\\s*${EMAIL_SOURCE}，或致电\\s*${PHONE_SOURCE}。`, '用于项目沟通。');
  replace(`至\\s*${EMAIL_SOURCE}，或致电\\s*${PHONE_SOURCE}。`, '。');
  replace(`，或通过电话\\s*${PHONE_SOURCE}、邮箱\\s*${EMAIL_SOURCE}联系。`, '。');
  if (edits.some((edit) => edit.replacement === '。') && /可(?:先)?发送/.test(text)) {
    replace('可先发送', '可先提供');
    replace('可发送', '可提供');
  }
  return edits;
}

function isMetadataLine(text: string) {
  return /^(?:发布单位|技术署名)\s*[:：]\s*[^\r\n]+$/.test(text.trim());
}

function isNormalizedFooter(paragraph: HTMLElement) {
  if (paragraph.tagName !== 'P') return false;
  const lines = textIndex(paragraph).text.split('\n').map((line) => line.trim());
  let index = 0;
  if (new RegExp(`^${PHONE_LABEL}${PHONE_SOURCE}$`).test(lines[index] || '')) index += 1;
  if (new RegExp(`^${EMAIL_LABEL}${EMAIL_SOURCE}$`).test(lines[index] || '')) index += 1;
  return index > 0 && lines.slice(index).every(isMetadataLine);
}

// An imported composite footer may have extra breaks or punctuation. Split
// only known footer lines before normalization, so metadata stays after contact
// values. Already-correct composite paragraphs need no work on subsequent calls.
function splitUnformattedCompositeFooters(root: HTMLElement) {
  let changed = 0;
  for (const paragraph of Array.from(root.querySelectorAll('p'))) {
    if (paragraph.closest(EXCLUDED) || isNormalizedFooter(paragraph)) continue;
    const { text, parts } = textIndex(paragraph);
    const lines = Array.from(text.matchAll(/[^\n]+/g));
    const phoneLine = new RegExp(`^${PHONE_LABEL}${PHONE_SOURCE}[\\s；;，,。.!！|｜、]*$`);
    const emailLine = new RegExp(`^${EMAIL_LABEL}${EMAIL_SOURCE}[\\s；;，,。.!！|｜、]*$`);
    const values = lines.map((line) => line[0].trim()).filter(Boolean);
    if (!values.some(isMetadataLine) || !values.some((line) => phoneLine.test(line) || emailLine.test(line))) continue;
    if (!values.every((line) => isMetadataLine(line) || phoneLine.test(line) || emailLine.test(line))) continue;
    const fragment = root.ownerDocument.createDocumentFragment();
    for (const line of lines) {
      if (!line[0].trim()) continue;
      const part = root.ownerDocument.createElement('p');
      if (!fragment.firstChild) {
        for (const attribute of Array.from(paragraph.attributes)) part.setAttribute(attribute.name, attribute.value);
      }
      part.append(slice(paragraph, parts, line.index!, line.index! + line[0].length));
      fragment.append(part);
    }
    paragraph.replaceWith(fragment);
    changed += 1;
  }
  return changed;
}

function compactAdjacentFooterParagraphs(root: HTMLElement) {
  let changed = 0;
  for (const paragraph of Array.from(root.querySelectorAll('p'))) {
    if (!paragraph.parentNode || paragraph.closest(EXCLUDED)) continue;
    const text = paragraph.textContent || '';
    if (!pureContact(text) || !new RegExp(`${PHONE_SOURCE}|${EMAIL_SOURCE}`).test(text)) continue;
    const group: HTMLElement[] = [paragraph];
    let next = paragraph.nextElementSibling;
    while (next?.tagName === 'P') {
      const content = next.textContent || '';
      const contact = pureContact(content) && new RegExp(`${PHONE_SOURCE}|${EMAIL_SOURCE}`).test(content);
      const metadata = isMetadataLine(content) && !next.querySelector('br');
      if (!contact && !metadata) break;
      group.push(next as HTMLElement);
      next = next.nextElementSibling;
    }
    if (group.length < 2) continue;
    const combined = root.ownerDocument.createElement('p');
    for (const attribute of Array.from(paragraph.attributes)) combined.setAttribute(attribute.name, attribute.value);
    combined.append(...Array.from(paragraph.childNodes));
    for (const following of group.slice(1)) {
      combined.append(root.ownerDocument.createElement('br'));
      if (following.attributes.length) {
        const line = root.ownerDocument.createElement('span');
        for (const attribute of Array.from(following.attributes)) line.setAttribute(attribute.name, attribute.value);
        line.append(...Array.from(following.childNodes));
        combined.append(line);
      } else combined.append(...Array.from(following.childNodes));
    }
    paragraph.replaceWith(combined);
    group.slice(1).forEach((element) => element.remove());
    changed += 1;
  }
  return changed;
}

function collectRuns(root: HTMLElement) {
  const runs: { parent: HTMLElement; nodes: Node[] }[] = [];
  function visit(parent: HTMLElement) {
    if (parent.matches(EXCLUDED) || parent.closest(EXCLUDED) || isNormalizedFooter(parent)) return;
    let nodes: Node[] = [];
    const flush = () => {
      if (nodes.length) runs.push({ parent, nodes });
      nodes = [];
    };
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === 1 && BLOCKS.has((child as HTMLElement).tagName)) {
        flush();
        visit(child as HTMLElement);
      } else nodes.push(child);
    }
    flush();
  }
  visit(root);
  return runs;
}

/** Format only the known public contact values at the final Chinese display layer. */
export function normalizeNewsContactFormat(root: HTMLElement) {
  const document = root.ownerDocument;
  let changedBlocks = splitUnformattedCompositeFooters(root);
  const runs = collectRuns(root);
  const footerTexts = [
    ...runs.map(({ nodes }) => nodes.map((node) => node.textContent || '').join('')),
    ...Array.from(root.querySelectorAll('p')).filter((paragraph) => !paragraph.closest(EXCLUDED) && isNormalizedFooter(paragraph))
      .map((paragraph) => textIndex(paragraph).text.split('\n').filter((line) => !isMetadataLine(line)).join('\n')),
  ];
  const hasExistingFooter = footerTexts.some((text) => new RegExp(PHONE_SOURCE).test(text) && pureContact(text))
    && footerTexts.some((text) => new RegExp(EMAIL_SOURCE).test(text) && pureContact(text));
  const unhandledBlocks: string[] = [];

  for (const { parent, nodes } of runs) {
    if (!nodes.every((node) => node.parentNode === parent)) continue;
    const probe = document.createElement('div');
    nodes.forEach((node) => probe.append(node.cloneNode(true)));
    const { text, parts } = textIndex(probe);
    const phone = text.match(new RegExp(PHONE_SOURCE));
    const email = text.match(new RegExp(EMAIL_SOURCE));
    if (!phone && !email) continue;
    if ((text.match(new RegExp(PHONE_SOURCE, 'g'))?.length ?? 0) > 1 || (text.match(new RegExp(EMAIL_SOURCE, 'g'))?.length ?? 0) > 1) {
      unhandledBlocks.push(text);
      continue;
    }

    const proseEdits = narrativeEdits(text);
    const edits = [...proseEdits];
    const unlabelledPair = text.match(new RegExp(`咨询\\s*[:：]\\s*${PHONE_SOURCE}\\s*[|｜]\\s*${EMAIL_SOURCE}`));
    if (unlabelledPair) edits.push({ start: unlabelledPair.index!, end: unlabelledPair.index! + unlabelledPair[0].length, replacement: '' });
    for (const source of [`${PHONE_LABEL}${PHONE_SOURCE}`, `${EMAIL_LABEL}${EMAIL_SOURCE}`]) {
      const match = text.match(new RegExp(source));
      if (match && !edits.some((edit) => edit.start <= match.index! && edit.end >= match.index! + match[0].length)) {
        let start = match.index!;
        let end = start + match[0].length;
        // A contact label may follow a CTA link or another contact value.
        while (start > 0 && /[\s；;，,|｜、]/.test(text[start - 1])) start -= 1;
        while (end < text.length && /[\s；;，,。.!！|｜、]/.test(text[end])) end += 1;
        edits.push({ start, end, replacement: '' });
      }
    }
    const values = [phone, email].filter(Boolean) as RegExpMatchArray[];
    if (!edits.length && pureContact(text)) edits.push({ start: 0, end: text.length, replacement: '' });
    if (values.some((match) => !edits.some((edit) => edit.start <= match.index! && edit.end >= match.index! + match[0].length))) {
      unhandledBlocks.push(text);
      continue;
    }
    // Merge touching contact-label removals, keeping narrative replacements intact.
    edits.sort((a, b) => a.start - b.start);
    const merged: Edit[] = [];
    for (const edit of edits) {
      const last = merged.at(-1);
      if (last && edit.start <= last.end && !edit.replacement && !last.replacement) last.end = Math.max(last.end, edit.end);
      else if (!last || edit.start >= last.end) merged.push(edit);
    }
    const prose = document.createElement('p');
    let position = 0;
    for (const edit of merged) {
      if (edit.start > position) prose.append(slice(probe, parts, position, edit.start));
      if (edit.replacement) prose.append(document.createTextNode(edit.replacement));
      position = edit.end;
    }
    if (position < text.length) prose.append(slice(probe, parts, position, text.length));
    // Remove break/punctuation left between labels, never inside retained prose.
    if (!(prose.textContent || '').replace(SEPARATORS, '')) prose.replaceChildren();
    while (prose.firstChild?.nodeName === 'BR' || prose.lastChild?.nodeName === 'BR') {
      if (prose.firstChild?.nodeName === 'BR') prose.firstChild.remove();
      if (prose.lastChild?.nodeName === 'BR') prose.lastChild.remove();
    }
    if (prose.firstChild?.nodeType === 3) prose.firstChild.textContent = (prose.firstChild.textContent || '').replace(/^[\s；;，,|｜、]+/, '');
    if (prose.lastChild?.nodeType === 3) prose.lastChild.textContent = (prose.lastChild.textContent || '').trimEnd();
    const output = document.createDocumentFragment();
    if (prose.textContent?.trim() || prose.querySelector('a')) output.append(prose);
    if (!proseEdits.length || !hasExistingFooter) {
      const contact = document.createElement('p');
      if (phone) {
        contact.append(document.createTextNode(labelBefore(text, phone.index!, PHONE_LABEL, '咨询电话：')), valueFragment(probe, parts, phone));
      }
      if (email) {
        if (phone) contact.append(document.createElement('br'));
        contact.append(document.createTextNode(labelBefore(text, email.index!, EMAIL_LABEL, '邮箱：')), valueFragment(probe, parts, email));
      }
      output.append(contact);
    }
    // Retain attributes of an existing paragraph, rather than introducing nesting.
    const replaceWholeParagraph = parent.tagName === 'P' && nodes.length === parent.childNodes.length;
    if (replaceWholeParagraph && output.firstElementChild) {
      for (const attribute of Array.from(parent.attributes)) output.firstElementChild.setAttribute(attribute.name, attribute.value);
    }
    const comparison = document.createElement('div');
    comparison.append(output.cloneNode(true));
    if (replaceWholeParagraph && comparison.innerHTML === parent.outerHTML) continue;
    if (replaceWholeParagraph) parent.replaceWith(output);
    else {
      parent.insertBefore(output, nodes[0]);
      nodes.forEach((node) => node.parentNode === parent && parent.removeChild(node));
    }
    changedBlocks += 1;
  }

  // Older posts have two standalone paragraphs in email/phone order.
  for (const paragraph of Array.from(root.querySelectorAll('p'))) {
    if (paragraph.closest(EXCLUDED)) continue;
    const next = paragraph.nextElementSibling;
    if (!next || next.tagName !== 'P') continue;
    const first = paragraph.textContent || '';
    const second = next.textContent || '';
    if (!pureContact(first) || !pureContact(second)) continue;
    const firstPhone = new RegExp(PHONE_SOURCE).test(first);
    const firstEmail = new RegExp(EMAIL_SOURCE).test(first);
    const secondPhone = new RegExp(PHONE_SOURCE).test(second);
    const secondEmail = new RegExp(EMAIL_SOURCE).test(second);
    if (firstPhone === firstEmail || secondPhone === secondEmail || firstPhone === secondPhone) continue;
    // Already-correct phone/email paragraphs need no changes. For email-first
    // imports, move the existing phone paragraph intact instead of discarding
    // paragraph attributes by rebuilding both paragraphs.
    if (firstEmail && secondPhone) {
      paragraph.before(next);
      changedBlocks += 1;
    }
  }
  changedBlocks += compactAdjacentFooterParagraphs(root);
  return { changedBlocks, unhandledBlocks };
}
