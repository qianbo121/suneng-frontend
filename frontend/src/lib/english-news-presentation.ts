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

const resourceCovers: Record<string, { original: string; english: string }> = {
  'heat-treatment-furnace-loading-rack-fixture-selection': {
    original: '/uploads/2026/09/1790148564337-7736bf9c-4ef0-45c4-9c85-a21cf6e652e2.webp',
    english: '/images/news/resources-en/93-cover.webp',
  },
  'multi-product-heat-treatment-furnace-changeover-boundaries': {
    original: '/uploads/2026/09/1790148509758-002217f2-b2bc-4a57-9059-47fc3da72956.webp',
    english: '/images/news/resources-en/92-cover.webp',
  },
  'quench-tank-batch-interval-thermal-balance': {
    original: '/uploads/2026/09/1789552830430-67618376-9e39-4deb-8558-2687d386f19e.webp',
    english: '/images/news/resources-en/90-cover.webp',
  },
  'steel-annealing-500-tonnes-two-bogie-hearth-furnaces-capacity': {
    original: '/uploads/2026/09/1789532562869-5180aebb-f93b-4bde-a9c8-a237de863e0a.webp',
    english: '/images/news/resources-en/89-cover.webp',
  },
};

export function getReviewedEnglishNewsCover(
  slug?: string | null,
  sourceImage?: string | null,
): string | undefined {
  if (slug === 'atmosphere-furnace-pressure-fluctuation-process-or-equipment') {
    return diagrams[slug].replacement.replace(/\.svg$/, '.png');
  }
  const cover = slug ? resourceCovers[slug] : undefined;
  const path = sourceImage?.replace(/^https?:\/\/(?:www\.)?jssngyl\.cn(?=\/)/i, '');
  return cover && path === cover.original ? cover.english : undefined;
}

export function localizeEnglishNewsPresentation(html: string, slug?: string | null): string {
  let result = html.replace(
    /(<a\b[^>]*\bhref=["'])(?:https?:\/\/(?:www\.)?jssngyl\.cn)?\/zh\/service\/furnace-renovation-overhaul\/?(["'][^>]*>)([\s\S]*?)(<\/a>)/gi,
    (_match, opening: string, attrs: string, label: string, closing: string) =>
      `${opening}/en/service/furnace-renovation-overhaul${attrs}${label.replace(/\s*\(Chinese\)/g, '')}${closing}`,
  );
  result = result.replace(
    /(<a\b[^>]*\bhref=["'])(?:https?:\/\/(?:www\.)?jssngyl\.cn)?\/zh\/partner\/?(["'][^>]*>)([\s\S]*?)(<\/a>)/gi,
    (_match, opening: string, attrs: string, label: string, closing: string) =>
      `${opening}/en/partner${attrs}${label.replace(/\s*\(Chinese\)/g, '')}${closing}`,
  );
  if (slug === 'quench-tank-batch-interval-thermal-balance') {
    const original = '/uploads/2026/09/1789552831265-f309bfde-a481-477f-b4b9-792115297dc3.webp';
    for (const prefix of ['https://www.jssngyl.cn', 'https://jssngyl.cn', '']) {
      result = result.replaceAll(prefix + original, '/images/news/resources-en/90-body.webp');
    }
    result = result.replace(/<img\b[^>]*>/gi, (tag) =>
      tag.includes('/images/news/resources-en/90-body.webp') ? tag.replace(/\s(?:width|height)=["'][^"']*["']/gi, '') : tag,
    );
  }
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
