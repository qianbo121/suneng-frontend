import { getCaseBuyerLinks } from '@/lib/buyer-selection-guides';

const titles: Record<string, string> = {
  '轴承钢丝球化退火用什么炉？': 'Which furnace should you choose for spheroidising bearing-steel wire?',
  '旧台车炉改造需要先确认什么？': 'What should you confirm before renovating an existing bogie-hearth furnace?',
  '箱式炉快速出料与入水方案怎样选择？': 'How should you choose a box-furnace unloading and water-quench transfer arrangement?',
};
const text: Record<string, string> = {
  'bearing-wire-trolley-annealing-proposal': 'For bearing-steel wire spheroidising, compare this bogie-loading arrangement with pit-furnace retorts and bell-furnace hood rotation.',
  'wire-coil-bottomless-retort-bottom-oil-top-cover-seal-proposal': 'The upper and lower seals and cooling provisions in this record help compare the conditions required by pit-retort, bogie-hearth and bell-furnace arrangements for wire annealing.',
  'bearing-wire-coil-bell-furnace-shared-heating-cooling-hood-scheduling-proposal': 'When choosing how to load and unload bearing-steel wire, compare this hood-rotation arrangement with bogie-hearth and pit-furnace proposals.',
  'trolley-furnace-three-meter-extension-whole-furnace-retest-proposal': 'An extension changes more than chamber space. Check power supply, rails, existing and new zones, and acceptance-test preparation for an existing bogie-hearth furnace.',
  'large-trolley-dual-fuel-existing-air-flue-proposal': 'If existing fans, flues or controls will be retained, use the renovation guide to review reuse conditions, mode switching and supply responsibilities.',
  'bearing-wire-gas-conversion-oxygen-analysis-co-alarm-proposal': 'This fuel-conversion scope can inform a bogie-hearth renovation. Confirm the gas source, retained systems, shutdown arrangements and acceptance testing within one agreed scope.',
  'small-sheet-solution-furnace-tray-transfer-interfaces-proposal': 'The 5–7 seconds in this record cover tray delivery only. For a complete unloading-to-immersion comparison, review tray push/pull transfer, charging-fork transfer and bogie unloading as complete paths.',
  'high-temperature-shovel-transfer-trolley-comparison-proposal': 'The two furnace arrangements have different handling paths and timing conditions. Compare their unloading and immersion arrangements against the same end event.',
  'stainless-solution-furnace-fork-load-with-tooling-proposal': 'After establishing what the load rating includes, check the complete transfer path formed by the basket, furnace opening, fork-support surfaces and water tank.',
  'fork-furnace-buyer-basket-support-water-tank-proposal': 'After confirming the customer-supplied components, compare the basket, water tank and furnace using the same load and timing rules.',
};
export function getEnglishCaseBuyerLinks(slug: string) {
  return getCaseBuyerLinks(slug).flatMap((link) =>
    text[slug] && titles[link.label]
      ? [{ href: link.href.replace(/^\/zh\//, '/en/'), label: titles[link.label], text: text[slug] }]
      : [],
  );
}
