'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';

import { HeatGradient } from './shared/HeatGradient';
import { FurnaceAnimationSize, FurnacePlayMode, furnacePalette } from './shared/tokens';

type TrolleyFurnaceAnimationProps = {
  size?: FurnaceAnimationSize;
  playMode?: FurnacePlayMode;
};

function getScale(size: FurnaceAnimationSize) {
  if (size === 'sm') return 0.92;
  if (size === 'lg') return 1.06;
  return 1;
}

export function TrolleyFurnaceAnimation({
  size = 'md',
  playMode = 'auto',
}: TrolleyFurnaceAnimationProps) {
  const id = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();
  const scale = getScale(size);
  const cycleDuration = 5;
  const cycleTimes = [0, 0.24, 0.32, 0.8, 0.9, 1] as const;
  const loopTransition = {
    duration: cycleDuration,
    ease: [0.42, 0, 0.58, 1] as const,
    repeat: Infinity,
    repeatDelay: 0,
  } as const;
  const activeLoop = !prefersReducedMotion && playMode !== 'inView';
  const trolleyTravel = prefersReducedMotion ? 154 : [-196, 154, 154, 154, 154, 404];
  const heatOpacity = prefersReducedMotion ? 0.96 : [0, 0, 0.94, 0.94, 0.2, 0];
  const heatScale = prefersReducedMotion ? 1 : [0.7, 0.7, 1, 1, 0.84, 0.74];
  const workpieceHeat = prefersReducedMotion ? 0.88 : [0, 0, 0.82, 0.82, 0.18, 0];
  const flowOpacity = prefersReducedMotion ? 0.78 : [0, 0, 0.72, 0.72, 0, 0];
  const upperDash = prefersReducedMotion ? -102 : [0, 0, -4, -56, -104, -104];
  const lowerDash = prefersReducedMotion ? -88 : [0, 0, -8, -48, -96, -96];
  const wheelSpin = prefersReducedMotion ? 0 : 720;

  return (
    <div className="h-full w-full">
      <svg
        viewBox="0 0 480 320"
        className="h-full w-full"
        role="img"
        aria-label="台车炉工作示意动画"
      >
        <HeatGradient idPrefix={id} />

        <g transform={`translate(${240 - 240 * scale} ${160 - 160 * scale}) scale(${scale})`}>
          <rect x="18" y="18" width="444" height="284" rx="28" fill={`url(#${id}-scene)`} />
          <rect x="34" y="238" width="412" height="18" rx="9" fill={furnacePalette.floor} />
          <rect x="34" y="238" width="412" height="1.5" rx="0.75" fill={furnacePalette.floorLine} />

          <motion.g
            animate={{ x: trolleyTravel }}
            transition={{
              ...loopTransition,
              times: cycleTimes,
              repeat: activeLoop ? Infinity : 0,
            }}
          >
            <rect x="20" y="210" width="142" height="14" rx="7" fill="#485A6E" />
            <rect x="36" y="194" width="110" height="18" rx="7" fill="#5D6F83" />
            <rect x="44" y="168" width="30" height="26" rx="6" fill={`url(#${id}-workpiece)`} />
            <rect x="78" y="176" width="28" height="18" rx="5" fill={`url(#${id}-workpiece)`} />
            <rect x="108" y="164" width="30" height="30" rx="6" fill={`url(#${id}-workpiece)`} />

            <motion.rect
              x="42"
              y="164"
              width="98"
              height="34"
              rx="8"
              fill={`url(#${id}-heat)`}
              animate={{ opacity: workpieceHeat }}
              transition={{
                ...loopTransition,
                times: cycleTimes,
                repeat: activeLoop ? Infinity : 0,
              }}
            />

            <circle cx="48" cy="224" r="13" fill="#243446" />
            <circle cx="134" cy="224" r="13" fill="#243446" />
            <motion.g
              animate={{ rotate: wheelSpin }}
              transition={{
                duration: cycleDuration,
                ease: 'linear',
                repeat: activeLoop ? Infinity : 0,
              }}
              style={{ transformOrigin: '48px 224px' }}
            >
              <circle cx="48" cy="224" r="5.8" fill="#93A2AF" />
              <rect x="47" y="215.6" width="2" height="5.4" rx="1" fill="#1A2431" />
              <rect x="47" y="227" width="2" height="5.4" rx="1" fill="#1A2431" />
            </motion.g>
            <motion.g
              animate={{ rotate: wheelSpin }}
              transition={{
                duration: cycleDuration,
                ease: 'linear',
                repeat: activeLoop ? Infinity : 0,
              }}
              style={{ transformOrigin: '134px 224px' }}
            >
              <circle cx="134" cy="224" r="5.8" fill="#93A2AF" />
              <rect x="133" y="215.6" width="2" height="5.4" rx="1" fill="#1A2431" />
              <rect x="133" y="227" width="2" height="5.4" rx="1" fill="#1A2431" />
            </motion.g>
          </motion.g>

          <g>
            <rect x="120" y="74" width="240" height="184" rx="18" fill="#33455A" />
            <rect x="146" y="100" width="188" height="116" rx="14" fill="#101A2A" />

            <motion.ellipse
              cx="240"
              cy="158"
              rx="96"
              ry="58"
              fill={`url(#${id}-glow)`}
              filter={`url(#${id}-heat-blur)`}
              animate={{
                opacity: heatOpacity,
                scale: heatScale,
              }}
              transition={{
                ...loopTransition,
                times: cycleTimes,
                repeat: activeLoop ? Infinity : 0,
              }}
              style={{ transformOrigin: '240px 158px' }}
            />
            <motion.rect
              x="156"
              y="106"
              width="168"
              height="104"
              rx="14"
              fill={`url(#${id}-heat)`}
              animate={{ opacity: heatOpacity }}
              transition={{
                ...loopTransition,
                times: cycleTimes,
                repeat: activeLoop ? Infinity : 0,
              }}
            />

            <motion.path
              d="M166 130C188 110 218 102 248 106C280 110 308 124 326 146"
              fill="none"
              stroke={furnacePalette.heatFlow}
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeDasharray="9 10"
              animate={{
                opacity: flowOpacity,
                strokeDashoffset: upperDash,
              }}
              transition={{
                ...loopTransition,
                times: cycleTimes,
                repeat: activeLoop ? Infinity : 0,
              }}
            />
            <motion.path
              d="M168 188C192 204 224 212 254 208C286 204 312 188 328 164"
              fill="none"
              stroke={furnacePalette.heatFlowSoft}
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeDasharray="9 10"
              animate={{
                opacity: flowOpacity,
                strokeDashoffset: lowerDash,
              }}
              transition={{
                ...loopTransition,
                times: cycleTimes,
                repeat: activeLoop ? Infinity : 0,
              }}
            />
          </g>

          <g>
            <path
              d="M108 76C108 66.059 116.059 58 126 58H356C365.941 58 374 66.059 374 76V116H348V90H132V236H348V210H374V240C374 249.941 365.941 258 356 258H126C116.059 258 108 249.941 108 240V76Z"
              fill={`url(#${id}-shell)`}
            />
            <rect x="346" y="90" width="20" height="146" rx="8" fill={furnacePalette.shellDark} />
            <rect x="366" y="102" width="8" height="122" rx="4" fill={furnacePalette.accentBlue} opacity="0.62" />
            <rect x="126" y="58" width="230" height="20" rx="10" fill="#61758A" opacity="0.62" />
          </g>
        </g>
      </svg>
    </div>
  );
}
