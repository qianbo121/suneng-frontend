'use client';

import { motion } from 'framer-motion';

import { furnaceMotion, furnacePalette } from './tokens';

type FlowState = 'idle' | 'active' | 'tail';

type DashedHeatFlowProps = {
  upperPath: string;
  lowerPath: string;
  state: FlowState;
  loop: boolean;
};

function getOpacity(state: FlowState) {
  if (state === 'tail') return 0.82;
  if (state === 'active') return [0, 0.74, 0.72, 0.12];
  return 0;
}

function getOffset(state: FlowState) {
  if (state === 'tail') return -22;
  if (state === 'active') return [0, -18, -42];
  return 0;
}

export function DashedHeatFlow({ upperPath, lowerPath, state, loop }: DashedHeatFlowProps) {
  const repeat = state === 'active' && loop ? Infinity : 0;
  const transition = {
    duration: furnaceMotion.cycleSeconds,
    ease: furnaceMotion.ease,
    repeat,
    repeatDelay: furnaceMotion.loopDelaySeconds,
  } as const;

  return (
    <>
      <motion.path
        d={upperPath}
        fill="none"
        stroke={furnacePalette.heatFlow}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="9 10"
        animate={{
          opacity: getOpacity(state),
          strokeDashoffset: getOffset(state),
        }}
        transition={transition}
      />
      <motion.path
        d={lowerPath}
        fill="none"
        stroke={furnacePalette.heatFlowSoft}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="9 10"
        animate={{
          opacity: getOpacity(state),
          strokeDashoffset: getOffset(state),
        }}
        transition={{
          ...transition,
          delay: state === 'active' ? 0.2 : 0,
        }}
      />
    </>
  );
}
