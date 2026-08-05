export type EnglishProductMetadata = {
  title: string;
  description: string;
};

export const ENGLISH_PRODUCT_METADATA: Record<string, EnglishProductMetadata> = {
  'roller-mesh-belt-line': {
    title: 'Roller Mesh-Belt Furnace Line | Suneng',
    description:
      'Custom roller-supported mesh-belt furnace lines for continuous heat treatment. Configure process zones, belt width, throughput and controls by project.',
  },
  'copper-wire-annealing-line': {
    title: 'Copper Wire Annealing Line | Suneng',
    description:
      'Custom continuous copper-wire annealing lines. Define wire range, throughput, atmosphere, cooling, take-up and control requirements for quotation.',
  },
  'annealing-solution-line': {
    title: 'Annealing & Solution-Treatment Line | Suneng',
    description:
      'Custom continuous annealing and solution-treatment lines for metal strip. Plan process zones, speed, cooling, atmosphere and acceptance criteria.',
  },
  'box-furnace': {
    title: 'Box Heat-Treatment Furnace | Suneng',
    description:
      'Custom box furnaces for batch heat treatment. Confirm workpiece size, charge, process temperature, heating method and uniformity acceptance conditions.',
  },
  'trolley-furnace': {
    title: 'Bogie-Hearth Furnace | Suneng',
    description:
      'Custom bogie-hearth furnaces for large batch loads. Define chamber size, charge weight, process curve, energy source, loading and acceptance conditions.',
  },
  'pit-furnace': {
    title: 'Pit Heat-Treatment Furnace | Suneng',
    description:
      'Custom pit furnaces for long or vertically loaded workpieces. Configure working zone, load, circulation, lifting, atmosphere and process controls.',
  },
  'bell-furnace': {
    title: 'Bell-Type Furnace | Suneng',
    description:
      'Custom bell-type furnaces for controlled batch heat treatment. Define charge form, atmosphere, circulation, cooling and acceptance requirements.',
  },
  'pusher-furnace': {
    title: 'Pusher Heat-Treatment Furnace | Suneng',
    description:
      'Custom pusher furnaces for continuous production. Plan workpiece transport, heating zones, cycle time, atmosphere, cooling and control interfaces.',
  },
  'mesh-belt-furnace': {
    title: 'Continuous Mesh-Belt Furnace | Suneng',
    description:
      'Custom mesh-belt furnaces for continuous heat treatment. Define part layout, belt load, process time, atmosphere, cooling and quality acceptance.',
  },
  'roller-hearth-furnace': {
    title: 'Roller-Hearth Furnace | Suneng',
    description:
      'Custom roller-hearth furnaces for continuous heat treatment. Configure roller system, process zones, throughput, atmosphere and line interfaces.',
  },
  'rotary-hearth-furnace': {
    title: 'Rotary-Hearth Furnace | Suneng',
    description:
      'Custom rotary-hearth furnaces for indexed or continuous heating. Define charge layout, cycle, heating zones, discharge and control requirements.',
  },
};

export function getEnglishProductMetadata(slug: string) {
  return ENGLISH_PRODUCT_METADATA[slug];
}
