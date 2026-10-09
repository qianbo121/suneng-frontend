const ENGLISH_TROLLEY_RESOURCES: ReadonlyArray<readonly [string, string]> = [
  ['Trolley furnace quotation: eight input groups', '/en/news/tai-che-lu-bao-jia-xu-yao-ti-gong-na-xie-can-shu'],
  ['High-temperature trolley furnace: quotation boundaries', '/en/news/shuju-news-17'],
  ['Trolley furnace manufacturer: five evidence checks', '/en/news/tai-che-lu-chang-jia-zen-me-xuan-xian-he-yan-zhe-5-lei-neng-li-zheng-ju'],
];

export function getTrolleyProcurementResources(locale: string, slug: string) {
  return locale === 'en' && slug === 'trolley-furnace' ? ENGLISH_TROLLEY_RESOURCES : [];
}
