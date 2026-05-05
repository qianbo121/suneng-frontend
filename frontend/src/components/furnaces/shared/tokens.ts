export const furnacePalette = {
  sceneTop: '#0B1526',
  sceneBottom: '#0F1E33',
  heatPrimary: '#FF6A2C',
  heatSecondary: '#FFA827',
  heatTertiary: '#FFD66B',
  shellDark: '#3A4A5E',
  shellLight: '#5C6E82',
  workpieceLight: '#C8CFD8',
  workpieceDark: '#8F98A4',
  heatFlow: 'rgba(255, 214, 107, 0.68)',
  heatFlowSoft: 'rgba(255, 214, 107, 0.48)',
  floor: '#17233A',
  floorLine: '#2A3850',
  accentBlue: '#2D6CDF',
} as const;

export const furnaceMotion = {
  cycleSeconds: 4.2,
  loopDelaySeconds: 0.5,
  resetSeconds: 0.6,
  ease: [0.42, 0, 0.58, 1] as const,
} as const;

export type FurnaceAnimationSize = 'sm' | 'md' | 'lg';
export type FurnacePlayMode = 'hover' | 'auto' | 'inView';
