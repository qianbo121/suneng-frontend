'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FiCheck, FiChevronRight, FiGrid, FiMaximize, FiPause, FiPlay, FiZoomIn } from 'react-icons/fi';
import s from './LineFlow.module.css';

const assets = '/images/cases/fastener-mesh-belt';
const animation = assets + '/xray-line.mp4?v=3';
const poster = assets + '/xray-line.webp?v=3';

// Horizontal centre and magnification share the coordinate system of the exported film.
const stations = [
  { name: '上料', image: 'stage-infeed.webp', center: 143, zoom: 3.3, note: '螺丝钉由上料台送上网带。' },
  { name: '加热', image: 'stage-heating.webp', center: 471, zoom: 2.9, note: '工件在网带上穿过淬火炉的加热段。' },
  { name: '油淬', image: 'stage-quench.webp?v=2', center: 840, zoom: 4.1, note: '工件从炉口落下，进入油面以下。' },
  { name: '提升', image: 'stage-lift.webp?v=2', center: 990, zoom: 3.5, note: '倾斜的提升带从油槽中托起工件。' },
  { name: '清洗烘干', image: 'stage-wash-dry.webp', center: 1236, zoom: 3.5, note: '工件经清洗后进入烘干段。' },
  { name: '回火', image: 'stage-temper.webp', center: 1630, zoom: 2.9, note: '网带将工件送过回火炉。' },
  { name: '收料', image: 'stage-outfeed.webp', center: 1956, zoom: 3.4, note: '工件沿出料斜槽滑下，落入料框。' },
];

export function LineFlow() {
  const video = useRef<HTMLVideoElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  const focus = selected === null ? null : stations[selected];

  useEffect(() => {
    const player = video.current!;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = () => setRunning(!preference.matches);
    applyPreference();
    preference.addEventListener('change', applyPreference);
    let onscreen = false;
    const update = () => setInView(onscreen && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { onscreen = entry.isIntersecting; update(); });
    observer.observe(player.parentElement!);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      preference.removeEventListener('change', applyPreference);
    };
  }, []);

  useEffect(() => {
    const player = video.current!;
    let active = true;
    if (running && inView && !failed) {
      player.play().catch((err: DOMException) => {
        if (active && err.name !== 'AbortError') setRunning(false);
      });
    } else {
      player.pause();
    }
    return () => { active = false; };
  }, [running, inView, failed]);

  function togglePlayback() {
    if (failed) {
      video.current?.load();
      setFailed(false);
      setRunning(true);
    } else {
      setRunning(current => !current);
    }
  }

  function showStage(index: number) {
    setSelected(index);
    requestAnimationFrame(() => {
      const viewer = video.current?.parentElement;
      if (viewer && viewer.getBoundingClientRect().top < 85) {
        viewer.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    });
  }

  // Clamp the stage to the visible window even when its height limits magnification.
  const filmWidth = focus ? Math.round(focus.zoom * 100) : 100;
  const center = (focus?.center ?? 1040) / 2080;
  const left = focus
    ? `clamp(max(${100 - filmWidth}%, calc(100% - 620cqh)), max(${50 - filmWidth * center}%, calc(50% - ${620 * center}cqh)), 0px)`
    : '0px';
  return <div className={s.panel}>
    <div className={s.player}>
      <div className={s.controls}>
        {focus && <button type="button" onClick={() => setSelected(null)}>
          <FiMaximize aria-hidden />查看整线
        </button>}
        <button type="button" onClick={togglePlayback}>
          {running && !failed ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          {failed ? '重试播放' : running ? '暂停动画' : '播放动画'}
        </button>
      </div>
      <div id="xray-view" className={s.viewport} data-detail={Boolean(focus)}>
      <video ref={video} className={s.film} src={animation} poster={poster} loop muted playsInline preload="none" width={2080} height={580}
        aria-label="网带炉黑底工艺透视动画，展示螺丝钉从上料、加热、油淬、提升、清洗烘干、回火到收料的过程"
        onError={() => setFailed(true)}
        style={{ width: filmWidth + '%', left, transform: focus ? 'translateY(-54%)' : 'translateY(-52%)' }} />
      </div>
    </div>
    <p className={s.status} role="status">{failed ? '动画暂时无法播放。' : focus && focus.name + ' · ' + focus.note}</p>
    <div className={s.tray}>
      <p id="stage-cards-label" className={s.instruction}><FiGrid aria-hidden />点选下方工序卡片，查看局部动画</p>
      <div className={s.cards} role="group" aria-labelledby="stage-cards-label">
        {stations.map((stage, i) => <button type="button" key={stage.name} className={s.card}
          aria-controls="xray-view" aria-pressed={selected === i} onClick={() => showStage(i)}>
          <span className={s.thumb}>
            <Image src={assets + '/' + stage.image} width={450} height={195} unoptimized alt="" />
            <span className={s.magnifier}><FiZoomIn aria-hidden /></span>
          </span>
          <span className={s.caption}>{stage.name}{selected === i ? <FiCheck aria-hidden /> : <FiChevronRight aria-hidden />}</span>
        </button>)}
      </div>
    </div>
  </div>;
}
