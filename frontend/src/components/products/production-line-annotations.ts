import type { ProcessZone } from '@/lib/production-line-process-map';
import { lineDeviceOutlines, type DeviceOutline } from './production-line-outlines';

type Point = [number, number];
type Annotation = {
  label: Point;
  pin: Point;
  outline?: Point[];
  outlines?: DeviceOutline[];
  align?: 'end';
};

// Presentation coordinates refer to the same uncropped image as the process map.
// They position labels and visible emphasis; they do not define equipment scope.
const trackAnnotations: Record<string, Annotation> = {
  entry: { label: [7, 44], pin: [8.5, 70] },
  heat: { label: [22, 14], pin: [23, 47] },
  transfer: { label: [35.5, 6], pin: [39.5, 62] },
  press: {
    label: [50.5, -7],
    pin: [50.5, 25],
    outline: [
      [47.5, 4],
      [51.5, 4],
      [52, 24],
      [57, 24],
      [57, 66],
      [62, 70],
      [62, 82],
      [54, 84],
      [49, 85],
      [43, 82],
      [42, 69],
      [42, 25],
      [46.8, 24],
      [46.8, 9],
    ],
  },
  temper: {
    label: [79, 19],
    pin: [79, 44],
    outline: [
      [61.1, 42.3],
      [64.3, 42.1],
      [64.3, 40.3],
      [69.8, 40.3],
      [69.8, 37.9],
      [75, 37.9],
      [75, 35],
      [74.8, 34],
      [75.1, 32.5],
      [75.5, 31.9],
      [76.4, 31.9],
      [76.4, 29.9],
      [78.5, 29.7],
      [78.9, 30.7],
      [78.9, 37.8],
      [80.7, 37.8],
      [80.7, 29.1],
      [80.7, 26.5],
      [84.8, 26.4],
      [84.8, 29.1],
      [84.4, 29.1],
      [84.4, 38.1],
      [88.8, 38.5],
      [88.8, 41.7],
      [91.1, 41.7],
      [91.3, 44.2],
      [91.1, 60.3],
      [91.1, 66.6],
      [91.4, 69.6],
      [66.6, 78.1],
      [65.8, 78.1],
      [65.8, 77.1],
      [61, 76.1],
      [60.9, 73.9],
      [61.3, 73.7],
      [61.3, 58.3],
      [61.1, 57.9],
    ],
  },
};

const copperAnnotations: Record<string, Annotation> = {
  entry: { label: [8.5, 15], pin: [8.5, 45] },
  tension: { label: [19, 29], pin: [19, 46] },
  heat: { label: [44, 17], pin: [44, 44] },
  cool: { label: [70, 24], pin: [71, 47] },
  exit: { label: [89, 10], pin: [89, 37] },
};

const placementOverrides: Record<string, Record<string, Partial<Annotation>>> = {
  'fastener-quench-temper-line': { quench: { pin: [46, 60] } },
  'forging-waste-heat-qt-line': { equalize: { pin: [30.5, 40] } },
  'annealing-solution-line': { entry: { pin: [13, 64] } },
  'roller-mesh-belt-line': { exit: { label: [94, 1] } },
  'mesh-belt-carbonitriding-line': { exit: { label: [94.5, -3] } },
  'aluminum-forging-heating-line': { exit: { label: [84.5, 23] } },
  'aluminum-solution-aging-line': {
    entry: { label: [15, 18], align: 'end' },
    quench: { pin: [42, 68] },
  },
  'cylinder-curing-line': { heat: { pin: [62, 42] } },
  'multi-furnace-quench-cell': {
    quench: { label: [11.5, 5] },
    handler: { pin: [44.5, 70] },
  },
};

function getLabelPlacement(pageId: string, zone: ProcessZone): Annotation {
  if (pageId === 'track-shoe-press-quench-line' && trackAnnotations[zone.id])
    return trackAnnotations[zone.id];
  if (pageId === 'copper-wire-annealing-line' && copperAnnotations[zone.id])
    return copperAnnotations[zone.id];
  const [x, y, width, height] = zone.box;
  const center = x + width / 2;
  const bottom =
    (pageId === 'multi-furnace-quench-cell' && zone.id === 'handler') ||
    (pageId === 'aluminum-solution-aging-line' && zone.id === 'quench');
  return {
    label: [
      center,
      bottom
        ? 98
        : pageId === 'mesh-belt-carbonitriding-line' && zone.id === 'wash'
          ? 14
          : Math.max(-3, y - 18),
    ],
    pin: [center, bottom ? y + height * 0.65 : y + Math.min(12, height * 0.2)],
  };
}

export function getProcessAnnotation(pageId: string, zone: ProcessZone): Annotation {
  const annotation = getLabelPlacement(pageId, zone);
  return {
    ...annotation,
    ...placementOverrides[pageId]?.[zone.id],
    outlines:
      lineDeviceOutlines[pageId]?.[zone.id] ??
      (annotation.outline ? [annotation.outline] : undefined),
  };
}
