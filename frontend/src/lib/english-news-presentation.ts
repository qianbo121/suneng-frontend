// Presentation corrections for already-published English text. Chinese content
// and independently reviewed publication eligibility are unchanged.
const diagrams: Record<string, { original: string; replacement: string; obsoleteNote: string }> = {
  'atmosphere-furnace-pressure-fluctuation-process-or-equipment': {
    original: '/uploads/2026/09/1790149369676-c3722071-50ea-46f9-b44d-378de3848595.webp',
    replacement: '/images/news/english/atmosphere-pressure-review.svg',
    obsoleteNote: ' Diagram labels are in Chinese; the checking logic is explained above in English.',
  },
  'heat-treatment-furnace-loading-rack-fixture-selection': {
    original: '/uploads/2026/09/1790148564865-b250c61b-5513-4e4e-9873-fb5f6cff6896.webp',
    replacement: '/images/news/english/fixture-thermal-load.svg',
    obsoleteNote: ' Diagram labels are in Chinese; the calculation and its conditions are explained above in English.',
  },
  'multi-product-heat-treatment-furnace-changeover-boundaries': {
    original: '/uploads/2026/09/1790148510342-edd62829-8796-47aa-b3af-3aeb49b1b08d.webp',
    replacement: '/images/news/english/product-changeover-review.svg',
    obsoleteNote: ' Diagram labels are in Chinese; the three levels are explained above in English.',
  },
};

export function localizeEnglishNewsPresentation(html: string, slug?: string | null): string {
  let result = html.replace(
    /(<a\b[^>]*\bhref=["'])(?:https?:\/\/(?:www\.)?jssngyl\.cn)?\/zh\/service\/furnace-renovation-overhaul\/?(["'][^>]*>)([\s\S]*?)(<\/a>)/gi,
    (_match, opening: string, attrs: string, label: string, closing: string) =>
      `${opening}/en/service/furnace-renovation-overhaul${attrs}${label.replace(/\s*\(Chinese\)/g, '')}${closing}`,
  );
  const diagram = slug ? diagrams[slug] : undefined;
  if (diagram && result.includes(diagram.original)) {
    // Replace only the reviewed illustration, including any link to its original.
    for (const prefix of ['https://www.jssngyl.cn', 'https://jssngyl.cn', '']) {
      result = result.replaceAll(prefix + diagram.original, diagram.replacement);
    }
    result = result.replace(/<img\b[^>]*>/gi, (tag) => {
      if (!tag.includes(diagram.replacement)) return tag;
      return tag.replace(/\s(?:width|height)=["'][^"']*["']/gi, '').replace(/\s*\/?>(?=$)/, ' width="1000" height="905">');
    });
    result = result.replace(diagram.obsoleteNote, '');
  }
  if (slug === 'gb-t-30825-2026-heat-treatment-furnace-procurement') {
    result = result.replaceAll('标准版本与技术协议核对', 'standard edition and technical agreement review');
  }
  if (slug === 'steel-annealing-500-tonnes-two-bogie-hearth-furnaces-capacity') {
    result = result.replaceAll('台车炉月产能核对', 'bogie-hearth furnace monthly capacity review');
  }
  return result;
}
