import type { InfographicResource } from './infographics';
import { BUCKET_TEETH_INFOGRAPHIC_SLUG } from './news-content-type';

export const bucketTeethInfographicEn: InfographicResource = {
  id: -1009,
  slug: BUCKET_TEETH_INFOGRAPHIC_SLUG,
  title: 'Water toughening high-manganese steel bucket teeth and liners — fork-handling or bogie-hearth furnace?',
  summary: 'Can you lift the whole basket with forks? Can the castings be tipped? If a basket of teeth or a single liner must stay in its loading position, start with a fork-handling furnace, a dedicated fork transfer car and a water tank in front of the furnace. For teeth that can be tipped, compare a bogie-hearth furnace with a tipping device and quench tank. If a liner could dent or distort, ask for a drawing showing how a cradle will support it during transfer.',
  topic: 'selection',
  equipmentLabel: 'Fork-handling furnace',
  furnaces: ['trolley'],
  image: '/images/infographics/bucket-teeth-liners-furnace-selection-01-en.png',
  imageAlt: 'Page 1. Steel grade and quench conditions, two handling routes, and the load, transfer time and temperature limits for the long-bar and pipe-fitting configurations.',
  imageSize: { width: 1524, height: 2094 },
  additionalPages: [{
    image: '/images/infographics/bucket-teeth-liners-furnace-selection-02-en.png',
    imageAlt: 'Page 2. Transfer timing, water volume by casting weight or hourly throughput, water-temperature recovery, quotation scope and supplier responsibilities.',
    width: 1524, height: 2094,
  }],
  caption: 'The equipment illustrations show the handling steps.',
  paragraphs: [
    'Jiangsu Suneng Industrial Furnace Co., Ltd., in Jiangyan, Taizhou, can design either route around the workpiece. Suneng also calls its fork-handling furnace a fork-tooth furnace. The rapid-quench configuration is a fork-handling rapid-quench furnace. Two existing agreements offer starting points. The long-bar configuration specifies 5 tonnes of workpieces per batch and a transfer time of ≤30 seconds. The pipe-fitting and flange configuration specifies 7 tonnes including the basket and a transfer time of ≤50 seconds. Both clocks start when the workpieces begin moving out and stop when the whole batch is submerged. Choose the closer loading arrangement, recalculate for your drawings and specify the terms in your own agreement.',
    'GB/T 5680–2023 calls for uniform heating and soaking followed by rapid immersion. After the castings enter the tank, water temperature must be ≤50 °C. ZG90Mn14Mo castings may be supplied without heat treatment when both conditions are met: thickness below 45 mm and carbon content below 0.8%. For the other grades covered, the water-toughening temperature is at least 1,040 °C.',
    'Size the tank for the weight of castings immersed per batch and account separately for hot baskets and lifting fixtures. The Henan foundry association process guide gives a general water allowance of 8–10 times the weight of the castings, or about 40–50 tonnes of water for 5 tonnes of castings. For back-to-back loads, check that the water cools to the required starting temperature before the next batch enters.',
    'Ask each supplier to draw the route for your heaviest charge. How will the parts leave the furnace, what will support them, and where will the whole load be fully underwater? Give every supplier the same load, timing points and tank conditions. Ask who supplies the furnace and temperature controls, handles the transfer, provides the tank and cooling circuit, and takes responsibility for installation, commissioning and acceptance trials with a load.',
  ],
  sourceNote: 'Read Suneng’s full technical article on furnace and supplier selection for high-manganese steel bucket teeth and liners.',
  sourceUrl: 'https://www.jssngyl.cn/en/news/high-manganese-steel-bucket-teeth-liners-water-toughening-furnace',
  tags: ['WaterToughening', 'BucketTeeth', 'WearLiners', 'ForkHandlingFurnace', 'ForkToothFurnace', 'BogieHearthFurnace', 'FurnaceSelection'],
  rows: [
    { label: 'Load must keep its orientation', value: 'Fork-handling furnace, dedicated fork transfer car and water tank in front of the furnace', condition: 'Confirm that the whole basket of teeth or the single liner can be lifted and supported.' },
    { label: 'Bucket teeth can be tipped', value: 'Bogie-hearth furnace, tipping device and quench tank', condition: 'Confirm that the castings can tolerate the drop.' },
    { label: 'Liner prone to dents or distortion', value: 'Ask for a separate cradle-transfer drawing.', condition: 'Confirm support points against the liner drawing.' },
  ],
  flows: [],
  conditions: [
    'The 30- and 50-second limits apply to the reference long-bar and pipe-fitting/flange configurations respectively. Recalculate for the actual bucket teeth or liner drawings.',
    'Use the same batch load, timing points and tank conditions for all quotations. Record the scope of supply and acceptance criteria.',
  ],
};
