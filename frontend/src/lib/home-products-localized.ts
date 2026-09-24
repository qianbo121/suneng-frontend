import { type HomeProductionLine } from './home-product-types';
import { productCenterProductionLines } from './products-landing-data';
import { translateLineValue } from './production-line-content-en';

// Both locales use the current reviewed homepage selection.
const featuredLineIds = [
  'track-shoe-press-quench-line',
  'forging-waste-heat-qt-line',
  'fastener-quench-temper-line',
];
const featuredHomeLines = featuredLineIds.map((id) => {
  const line = productCenterProductionLines.find((item) => item.id === id);
  if (!line) throw new Error(`Missing featured homepage production line: ${id}`);
  return { ...line, summary: line.process };
});

export function getHomeProductionLines(locale: 'zh' | 'en'): readonly HomeProductionLine[] {
  return locale === 'zh' ? featuredHomeLines : translateLineValue(featuredHomeLines);
}

// Shared by homepage spotlights and all product-list lines. Captions follow each
// line's reviewed six-stage sequence in production-line-animation-config.ts.
export const homeLineMotionCopyEn: Record<string, { stages: readonly string[]; note: string }> = {
  'track-shoe-press-quench-line': {
    stages: [
      'Track shoes enter the roller conveyor in sequence',
      'Workpieces heat inside the furnace',
      'Transfer and locate the workpiece; lower the rollers to seat it on the die',
      'Close the die to restrain the workpiece and apply the cooling medium',
      'Open the die, retract the stop and lift the workpiece for tempering and cooling',
      'Inspect dimensions and properties after cooling',
    ],
    note: 'Electric heating and spray-quenching concept; cycle time is compressed.',
  },
  'forging-waste-heat-qt-line': {
    stages: [
      'Check hot-forging temperature and segregate nonconforming parts',
      'Equalize temperature as needed within the permitted process window',
      'Transfer the loaded tray promptly to the quenching station',
      'Lower the load into the liquid under control, then lift and drain',
      'Transfer to a separate tempering furnace',
      'Hand over for inspection after final cooling',
    ],
    note: 'Reference route for hot forgings cleared for processing; cycle time is compressed.',
  },
  'fastener-quench-temper-line': {
    stages: [
      'Spread fasteners evenly on the mesh belt',
      'Heat and soak under a controlled atmosphere',
      'Quench in liquid, convey through the tank and lift out',
      'Wash and dry in a separate section',
      'Enter a separate tempering furnace',
      'Collect parts after cooling',
    ],
    note: 'Continuous mesh-belt concept; liquid color does not identify the quenching medium.',
  },
  'mesh-belt-carbonitriding-line': {
    stages: [
      'Clean, dry and distribute parts evenly',
      'Carburize and diffuse in the sealed furnace',
      'Quench in the enclosed oil tank, then lift out',
      'Wash and dry in a separate section',
      'Temper at low temperature to relieve quenching stress',
      'Hand over for quality verification after final cooling',
    ],
    note: 'Representative carburizing and oil-quenching route; not carbonitriding.',
  },
  'multi-furnace-quench-cell': {
    stages: [
      'Extend the manipulator forks, set down the tray and retract the forks',
      'Close the furnace door, then heat and soak',
      'Confirm the manipulator and quench tank are ready',
      'Open the door, retrieve the tray, retract the forks and travel along the rail',
      'Lower the loaded tray into the liquid under control',
      'Lift, drain and hand over to the next operation',
    ],
    note: 'One batch is handled at one furnace position at a time; select the medium for the process.',
  },
  'aluminum-solution-aging-line': {
    stages: [
      'Lift the loaded basket into the furnace on the suspension frame',
      'Close the bottom doors and soak for solution treatment',
      'Open the bottom doors and lower the load promptly under control',
      'Fully immerse the basket, then lift and drain',
      'Transfer to a separate aging furnace',
      'Unload and cool after aging',
    ],
    note: 'Controlled lifting and lowering; solution treatment and aging use separate furnaces.',
  },
  'aluminum-forging-heating-line': {
    stages: [
      'Convey aluminum billets lengthwise with stable support',
      'Raise temperature through hot-air heating zones',
      'Equalize and verify workpiece temperature',
      'Check exit temperature and segregate nonconforming parts',
      'Hand over within the required process window',
      'Transfer to the downstream forging interface',
    ],
    note: 'Roller-conveyor convection-heating concept; forging is a downstream interface.',
  },
  'cylinder-curing-line': {
    stages: [
      'Secure the cylinder ends on the rotating carrier',
      'Move the carrier while the cylinder rotates independently',
      'Raise temperature through hot-air heating zones',
      'Maintain rotation and soak to the specified curing schedule',
      'Keep the cylinder supported during controlled cooling',
      'Move the carrier out and hand over for unloading',
    ],
    note: 'Rotation with end supports; excludes curing gas-filled or pressurized cylinders.',
  },
  'roller-mesh-belt-line': {
    stages: ['Parts are spread on the mesh belt', 'Parts enter the heating zone', 'Parts pass through the soaking zone', 'Controlled cooling after heat treatment', 'Finished parts leave the belt', 'Inspect parts to the agreed requirements'],
    note: 'Process illustration; parameters depend on material and requirements.',
  },
  'copper-wire-annealing-line': {
    stages: ['Wire feeds from the payoff reel', 'Guides maintain the wire path', 'Wire passes through the annealing section', 'Wire cools under protection', 'Drying is provided where required', 'Annealed wire winds onto the take-up reel'],
    note: 'Process illustration; atmosphere and cooling depend on wire specifications.',
  },
  'annealing-solution-line': {
    stages: ['Strip feeds from the uncoiler', 'Prepare the strip for heating', 'Strip enters the heating section', 'Strip passes through the soaking section', 'Controlled cooling follows the hot zone', 'Treated strip is recoiled'],
    note: 'Process illustration; annealing and solution treatment use distinct recipes.',
  },
};
