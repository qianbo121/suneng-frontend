'use client';

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from 'react';
import { createTaskMotion, type TaskMotionKind } from './task-motion';
import styles from './TaskMotionDrawing.module.css';

export type TaskMotionHandle = { seek(seconds: number): void };

export const TaskMotionDrawing = forwardRef<
  TaskMotionHandle,
  { kind: TaskMotionKind; label: string }
>(function TaskMotionDrawing({ kind, label }, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const paint = useRef<(seconds: number) => void>(() => {});
  const prefix = 'task-' + useId().replace(/:/g, '') + '-';
  useImperativeHandle(ref, () => ({ seek: (seconds) => paint.current(seconds) }), []);
  useEffect(() => {
    if (!svgRef.current) return;
    paint.current = createTaskMotion(svgRef.current, kind);
    paint.current(0);
  }, [kind]);

  if (kind === 'heat-treatment-line')
    return (
      <svg
        ref={svgRef}
        className={styles.drawing}
        viewBox="-12 -10 808 380"
        role="img"
        aria-label={label}
      >
        <defs>
          <image
            id={prefix + 'sl-source'}
            data-part="sl-source"
            href="/images/home/scenario-01-heat-treatment-line-780.webp"
            width="780"
            height="344"
          />
          <clipPath id={prefix + 'sl-intake'} data-part="sl-intake">
            <path d="M5 243L151 236V286L5 299Z" />
          </clipPath>
          <clipPath id={prefix + 'sl-main-band'} data-part="sl-main-band">
            <path d="M5 280L143 268L150 279L11 294Z" />
          </clipPath>
          <clipPath id={prefix + 'sl-detail-circle'} data-part="sl-detail-circle">
            <circle cx="161" cy="397" r="77" />
          </clipPath>
          <clipPath id={prefix + 'sl-detail-band'} data-part="sl-detail-band">
            <path d="M50 402L252 371L279 391L77 427Z" />
          </clipPath>
          <linearGradient id={prefix + 'sl-metal'} data-part="sl-metal" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#d3e0e9" />
          </linearGradient>
          <g
            id={prefix + 'sl-workpiece'}
            data-part="sl-workpiece"
            stroke="#456781"
            strokeWidth="1.15"
            fill={'url(#' + prefix + 'sl-metal' + ')'}
          >
            <path d="M-10 -20V-3C-10 4 10 4 10-3V-20Z" />
            <ellipse cy="-20" rx="10" ry="4.3" fill="#f5f9fc" />
            <ellipse cy="-20" rx="5.4" ry="2.3" fill="#829eaf" />
            <path d="M-6 -17V-2M-2 -16V0M3 -16V0M7 -17V-2" fill="none" opacity=".5" />
          </g>
        </defs>
        <use href={'#' + prefix + 'sl-source'} />
        <g clipPath={'url(#' + prefix + 'sl-main-band' + ')'} stroke="#42637c" strokeWidth=".6">
          <path d="M5 280L143 268L150 279L11 294Z" fill="#e4edf4" />
          <g id={prefix + 'sl-small-treads'} data-part="sl-small-treads"></g>
        </g>
        <g
          id={prefix + 'sl-small-parts'}
          data-part="sl-small-parts"
          clipPath={'url(#' + prefix + 'sl-intake' + ')'}
        ></g>
        <path d="M9 270L147 259M9 284L147 272" stroke="#496a83" strokeWidth="1.25" fill="none" />
        <path
          d="M12 269V286M50 266V282M99 262V278M145 258V274"
          stroke="#496a83"
          strokeWidth="1.3"
        />
        <path d="M78 291L91 218L128 166" stroke="#8097ad" strokeWidth="1.2" fill="none" />
        <circle cx="78" cy="291" r="3" fill="#fff" stroke="#6f8ba4" />
        <g transform="translate(0 -303)">
          <circle cx="161" cy="397" r="79" fill="#fff" stroke="#c1cfdd" strokeWidth="1.5" />
          <g clipPath={'url(#' + prefix + 'sl-detail-circle' + ')'}>
            <rect x="75" y="315" width="180" height="170" fill="#fff" />
            <path
              d="M50 402L252 371L279 391L77 427Z"
              fill="#edf3f7"
              stroke="#42637c"
              strokeWidth="1.3"
            />
            <path
              d="M77 427L279 391V421L77 457Z"
              fill="#dce7ef"
              stroke="#42637c"
              strokeWidth="1.5"
            />
            <path d="M77 432L279 397M77 449L279 414" fill="none" stroke="#658198" strokeWidth="1" />
            <g
              clipPath={'url(#' + prefix + 'sl-detail-band' + ')'}
              id={prefix + 'sl-large-treads'}
              data-part="sl-large-treads"
              stroke="#7892a5"
              strokeWidth=".9"
            ></g>
            <g id={prefix + 'sl-wheels'} data-part="sl-wheels"></g>
            <g id={prefix + 'sl-large-parts'} data-part="sl-large-parts"></g>
            <path
              d="M67 463L276 426M91 455V477M224 433V466"
              fill="none"
              stroke="#496a83"
              strokeWidth="2"
            />
          </g>
        </g>
      </svg>
    );

  if (kind === 'furnace-selection')
    return (
      <svg
        ref={svgRef}
        className={styles.drawing}
        viewBox="-15 -25 1420 770"
        role="img"
        aria-label={label}
      >
        <defs>
          <image
            id={prefix + 'sm-source'}
            data-part="sm-source"
            href="/images/home/scenario-02-furnace-selection-780.webp"
            width="1380"
            height="693"
          />
          <clipPath id={prefix + 'sm-pit-clip'} data-part="sm-pit-clip">
            <path d="M75 202H311V350H75Z" />
          </clipPath>
          <clipPath id={prefix + 'sm-hood-clip'} data-part="sm-hood-clip">
            <rect x="1045" y="-2" width="340" height="453" />
          </clipPath>
          <clipPath id={prefix + 'sm-door-clip'} data-part="sm-door-clip">
            <rect x="852" y="329" width="177" height="300" />
          </clipPath>
          <mask
            id={prefix + 'sm-fixed-mask'}
            data-part="sm-fixed-mask"
            maskUnits="userSpaceOnUse"
            x="-10"
            y="-10"
            width="1400"
            height="740"
          >
            <rect x="-10" y="-10" width="1400" height="740" fill="white" />
            <path d="M75 202H311V350H75Z" fill="black" />
            <rect x="80" y="96" width="32" height="128" fill="black" />
            <rect x="1045" y="-2" width="340" height="453" fill="black" />
            <rect x="852" y="329" width="177" height="300" fill="black" />
          </mask>
          <linearGradient id={prefix + 'sm-steel'} data-part="sm-steel" x1="0" x2="1">
            <stop offset="0" stopColor="#f3f7fb" />
            <stop offset=".34" stopColor="#fff" />
            <stop offset="1" stopColor="#e5edf4" />
          </linearGradient>
        </defs>
        <use href={'#' + prefix + 'sm-source'} mask={'url(#' + prefix + 'sm-fixed-mask' + ')'} />
        <g stroke="#345570" strokeWidth="1.6" fill={'url(#' + prefix + 'sm-steel' + ')'}>
          <rect x="85" y="96" width="15" height="76" rx="3" />
          <path
            id={prefix + 'sm-piston'}
            data-part="sm-piston"
            d="M90 172V289M96 172V289"
            fill="none"
          />
        </g>
        <g id={prefix + 'sm-pit'} data-part="sm-pit" transform="translate(0 80)">
          <use
            href={'#' + prefix + 'sm-source'}
            clipPath={'url(#' + prefix + 'sm-pit-clip' + ')'}
          />
        </g>
        <g id={prefix + 'sm-door'} data-part="sm-door">
          <g id={prefix + 'sm-door-inside'} data-part="sm-door-inside">
            <use
              href={'#' + prefix + 'sm-source'}
              clipPath={'url(#' + prefix + 'sm-door-clip' + ')'}
            />
          </g>
          <g
            id={prefix + 'sm-door-outside'}
            data-part="sm-door-outside"
            stroke="#345570"
            strokeLinejoin="round"
            fill={'url(#' + prefix + 'sm-steel' + ')'}
          >
            <path d="M855 338L1008 357L1008 607L855 572Z" strokeWidth="2.8" />
            <path d="M863 348L998 366L998 593L863 564Z" strokeWidth="1.3" />
            <path d="M873 366L985 380L985 574L873 550Z" strokeWidth="1" fill="#f9fbfc" />
            <path
              d="M875 374L982 388M875 380L982 394M875 539L982 562M877 546L981 568"
              opacity=".25"
              fill="none"
            />
            <ellipse cx="929" cy="462" rx="16" ry="20" strokeWidth="2" fill="#e4ecf1" />
            <ellipse cx="929" cy="462" rx="10" ry="13" strokeWidth="1" fill="#b4c7d6" />
            <path d="M979 438V477M975 445H986V471H975" strokeWidth="2.6" fill="none" />
            <path d="M859 388H869V404H859M859 518H869V534H859" strokeWidth="2" />
          </g>
        </g>
        <g id={prefix + 'sm-hood'} data-part="sm-hood" transform="translate(0 62)">
          <use
            href={'#' + prefix + 'sm-source'}
            clipPath={'url(#' + prefix + 'sm-hood-clip' + ')'}
          />
        </g>
      </svg>
    );

  if (kind === 'old-furnace-diagnosis')
    return (
      <svg
        ref={svgRef}
        className={styles.drawing}
        viewBox="8 12 780 430"
        role="img"
        aria-label={label}
      >
        <defs>
          <image
            id={prefix + 'so-source'}
            data-part="so-source"
            href="/images/home/scenario-03-old-furnace-diagnosis-20260825-780.webp"
            width="780"
            height="440"
          />
          <mask
            id={prefix + 'so-fixed-mask'}
            data-part="so-fixed-mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="800"
            height="450"
          >
            <rect width="800" height="450" fill="white" />
            <path d="M537 167L611 176L611 311L537 303Z" fill="black" />
            <rect x="630" y="181" width="150" height="146" fill="black" />
            <rect x="576" y="248" width="66" height="10" fill="black" />
          </mask>
          <clipPath id={prefix + 'so-door-clip'} data-part="so-door-clip">
            <path d="M537 167L611 176L611 311L537 303Z" />
          </clipPath>
          <clipPath id={prefix + 'so-detail-clip'} data-part="so-detail-clip">
            <circle cx="701" cy="252" r="65" />
          </clipPath>
          <clipPath id={prefix + 'so-guides'} data-part="so-guides">
            <path d="M517 161H537V319H517ZM610 170H623V312H610Z" />
          </clipPath>
          <clipPath id={prefix + 'so-tray-visible'} data-part="so-tray-visible">
            <path d="M537 282L790 306V392L537 347Z" />
          </clipPath>
          <linearGradient id={prefix + 'so-chamber'} data-part="so-chamber" x1="0" x2="1">
            <stop stopColor="#1c354a" />
            <stop offset=".6" stopColor="#547185" />
            <stop offset="1" stopColor="#94aabd" />
          </linearGradient>
          <linearGradient id={prefix + 'so-steel'} data-part="so-steel" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#dbe5ed" />
          </linearGradient>
        </defs>
        <use href={'#' + prefix + 'so-source'} mask={'url(#' + prefix + 'so-fixed-mask' + ')'} />
        <path
          d="M537 167L611 176L611 311L537 303Z"
          fill={'url(#' + prefix + 'so-chamber' + ')'}
          stroke="#557186"
          strokeWidth="1"
        />
        <path
          d="M548 185L590 190V294L548 289ZM548 289L590 294L611 311L537 303Z"
          fill="none"
          stroke="#89a0b1"
          strokeWidth=".6"
          opacity=".6"
        />
        <g clipPath={'url(#' + prefix + 'so-tray-visible' + ')'}>
          <g
            id={prefix + 'so-tray'}
            data-part="so-tray"
            transform="translate(-140 -18)"
            stroke="#4c6a80"
            strokeLinejoin="round"
          >
            <g id={prefix + 'so-tray-wheels'} data-part="so-tray-wheels">
              <ellipse cx="578" cy="315" rx="6.5" ry="7.2" fill="#cddbe5" strokeWidth="1.1" />
              <ellipse cx="668" cy="329" rx="6.5" ry="7.2" fill="#cddbe5" strokeWidth="1.1" />
              <g id={prefix + 'so-wheel-one'} data-part="so-wheel-one">
                <path d="M574 315H582M578 311V319" fill="none" strokeWidth="1" />
              </g>
              <g id={prefix + 'so-wheel-two'} data-part="so-wheel-two">
                <path d="M664 329H672M668 325V333" fill="none" strokeWidth="1" />
              </g>
            </g>
            <path d="M548 298L593 292L741 314L696 321Z" fill="#f7f8f7" strokeWidth="1.25" />
            <path
              d="M548 298L696 321V333L548 310Z"
              fill={'url(#' + prefix + 'so-steel' + ')'}
              strokeWidth="1.25"
            />
            <path d="M696 321L741 314V326L696 333Z" fill="#cedde7" strokeWidth="1.2" />
            <path
              d="M574 296L722 317M601 300L583 303M632 305L614 308M662 309L644 313M694 313L675 318M554 304L690 325M552 308L693 330"
              fill="none"
              strokeWidth=".6"
              opacity=".65"
            />
            <path d="M558 301V310M685 323V331M704 321V328M730 317V323" strokeWidth="1" />
          </g>
        </g>
        <g id={prefix + 'so-door'} data-part="so-door">
          <use
            href={'#' + prefix + 'so-source'}
            clipPath={'url(#' + prefix + 'so-door-clip' + ')'}
          />
          <path d="M574 253H612" stroke="#eff3f5" strokeWidth="4" />
          <path d="M578 255H609" stroke="#7790a3" strokeWidth=".7" />
        </g>
        <use
          href={'#' + prefix + 'so-source'}
          clipPath={'url(#' + prefix + 'so-guides' + ')'}
          mask={'url(#' + prefix + 'so-fixed-mask' + ')'}
        />
        <g id={prefix + 'so-inspection'} data-part="so-inspection" opacity="0">
          <path d="M610 242L655 251" stroke="#e44f5c" strokeWidth="1.2" fill="none" />
          <circle cx="610" cy="242" r="3" fill="#fff" stroke="#e44f5c" strokeWidth="1.2" />
          <g transform="translate(106 38) scale(.85)">
            <use
              href={'#' + prefix + 'so-source'}
              clipPath={'url(#' + prefix + 'so-detail-clip' + ')'}
            />
          </g>
        </g>
      </svg>
    );

  return null;
});
