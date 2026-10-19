export const NEWS_ATTRIBUTION = '苏能工业炉工程技术团队&唐荔';

/** Update bylines only; preserve surrounding prose, links and inline markup. */
export function normalizeNewsAttribution(root: HTMLElement) {
  const excluded = 'table, pre, code, figure, figcaption, h1, h2, h3, h4, h5, h6';
  const blocks = 'p, div, section, article, li, blockquote';
  const runs: Node[][] = [];
  function collect(parent: Element) {
    let nodes: Node[] = [];
    const flush = () => {
      if (nodes.length) runs.push(nodes);
      nodes = [];
    };
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === 1 && (node as Element).matches(`${blocks}, ${excluded}, ul, ol`)) {
        flush();
        if (!(node as Element).matches(excluded)) collect(node as Element);
      } else nodes.push(node);
    }
    flush();
  }
  collect(root);
  for (const nodes of runs) {
    const parts: { node: Node; start: number; end: number }[] = [];
    let text = '';
    function visit(node: Node) {
      if (node.nodeType === 3) {
        const start = text.length;
        text += node.textContent ?? '';
        parts.push({ node, start, end: text.length });
      } else if (node.nodeName === 'BR') text += '\n';
      else Array.from(node.childNodes).forEach(visit);
    }
    nodes.forEach(visit);
    const pattern = /(?:^|\n)\s*(?:(?:(?:资料|技术)署名|Technical (?:author|attribution|credit))\s*[:：]\s*([^\n]+?)|((?:江苏)?苏能工业炉工程技术团队(?:\s*[&＆]\s*唐荔)?|Jiangsu Suneng Industrial Furnace Engineering Team))\s*(?=$|\n)|本文由((?:江苏)?苏能工业炉工程技术团队)整理/gi;
    for (const match of Array.from(text.matchAll(pattern)).reverse()) {
      const name = match[1] ?? match[2] ?? match[3];
      if (name === NEWS_ATTRIBUTION) continue;
      const start = match.index! + match[0].indexOf(name);
      const end = start + name.length;
      let inserted = false;
      for (const part of parts) {
        if (part.end <= start || part.start >= end) continue;
        const value = part.node.textContent ?? '';
        part.node.textContent = value.slice(0, Math.max(0, start - part.start))
          + (inserted ? '' : NEWS_ATTRIBUTION)
          + value.slice(Math.min(value.length, end - part.start));
        inserted = true;
      }
    }
  }
}
