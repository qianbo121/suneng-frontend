'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { FiCheck, FiChevronRight, FiGrid, FiMaximize, FiPause, FiPlay, FiZoomIn } from 'react-icons/fi';
import type { ProjectView } from '@/lib/cases/agreement/reader';
import s from './LineFlow.module.css';
import { TrackedFilm, type TrackedProject } from './TrackedFilm';

type Props = { steps: string[]; english: boolean } & (
  { view: ProjectView; image: string; film?: string; tracked?: never } |
  { tracked: TrackedProject; view?: never; image?: never; film?: never }
);

// All cameras and the workpiece path are registered to the project's own full-line illustration.
function detailFrame([x, y, width]: ProjectView['cameras'][number], ratio: number, sceneHeight: number) {
  const height = width / ratio;
  const left = Math.max(0, Math.min(1000 - width, x - width / 2));
  const top = Math.max(0, Math.min(sceneHeight - height, y - height / 2));
  return [left, top, width, height];
}

export function ProjectFlow({ steps, view, image, film, tracked, english }: Props) {
  const id = 'process-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const viewer = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [selection, setSelection] = useState<{ index: number | null; moving: boolean }>({ index: null, moving: false });
  const selected = selection.index;
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const label = (zh: string, en: string) => english ? en : zh;

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setRunning(!preference.matches);
    updatePreference();
    setReady(true);
    preference.addEventListener('change', updatePreference);
    let onscreen = false;
    const updateVisibility = () => setVisible(onscreen && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      onscreen = entry.isIntersecting;
      updateVisibility();
    });
    observer.observe(viewer.current!);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
      preference.removeEventListener('change', updatePreference);
    };
  }, []);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    let active = true;
    if (running && visible && !failed) {
      player.play().catch((err: DOMException) => {
        if (active && err.name !== 'AbortError') setRunning(false);
      });
    } else player.pause();
    return () => { active = false; };
  }, [running, visible, failed]);

  function togglePlayback() {
    if (failed) {
      setFailed(false);
      video.current?.load();
      setRunning(true);
    } else setRunning(current => !current);
  }

  function selectStage(index: number) {
    setSelection({ index, moving: running });
    const time = view?.stageSeconds?.[index];
    if (time !== undefined && video.current) {
      // Batch stations run one after the other. Show the matching operation even when paused.
      if (video.current.readyState === 0) video.current.preload = 'metadata';
      video.current.currentTime = time;
    }
    requestAnimationFrame(() => {
      if (viewer.current && viewer.current.getBoundingClientRect().top < 85)
        viewer.current.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }

  const sceneHeight = film ? 1000 * 580 / 2080 : 400;
  const frame = view && selected !== null ? detailFrame(view.cameras[selected], 2.5, sceneHeight) : [0, view?.top ?? 0, 1000, view?.height ?? sceneHeight];
  const [left, top, width, height] = frame;
  const playing = running && !failed;
  const title = selected === null ? label('整线工艺流转', 'Full-line process flow') : steps[selected];
  return <div className={s.panel}>
    <div className={s.player}>
      <div className={s.controls}>
        {selected !== null && <button type="button" onClick={() => setSelection({ index: null, moving: running })}>
          <FiMaximize aria-hidden />{label('查看整线', 'View full line')}
        </button>}
        <button type="button" onClick={togglePlayback} disabled={!ready} aria-pressed={playing}>
          {playing ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          {failed ? label('重试播放', 'Retry playback') : playing ? label('暂停动画', 'Pause animation') : label('播放动画', 'Play animation')}
        </button>
      </div>
      <div id={id} ref={viewer} className={s.viewport} data-detail={selected !== null}>
        {tracked && <TrackedFilm project={tracked} player={video} selection={selection} title={title} onError={() => setFailed(true)} />}
        {film && <div className={s.filmCrop} style={{
          width: `min(100cqw, ${100 * width / height}cqh)`,
          aspectRatio: `${width}/${height}`,
        }}>
          <video ref={video} src={film + '.mp4'} poster={film + '.webp'} loop muted playsInline preload="none"
            aria-label={title} onError={() => setFailed(true)} width={2080} height={580}
            style={{ width: (100000 / width) + '%', left: (-100 * left / width) + '%', top: (-100 * top / height) + '%' }} />
        </div>}
        {view && !film && <svg className={s.processPicture} viewBox={frame.join(' ')} role="img" aria-label={title}>
          <defs>
            <radialGradient id={id+'-ground'}><stop stopColor="#123447" /><stop offset="1" stopColor="#020e18" /></radialGradient>
            <filter id={id+'-steel'} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values=".19 .23 .13 0 .015  .28 .46 .16 0 .10  .30 .51 .19 0 .16  0 0 0 1 0" />
            </filter>
            <filter id={id+'-soft'} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation=".8" /></filter>
            <mask id={id+'-mask'} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="400">
              <polygon points={view.silhouette} fill="white" filter={'url(#'+id+'-soft)'} />
            </mask>
            <g id={id+'-machine'}>
              <rect x="-500" y="-200" width="2000" height="800" fill={'url(#'+id+'-ground)'} />
              <g mask={'url(#'+id+'-mask)'}>
                <image href={image} width="1000" height="400" preserveAspectRatio="none" filter={'url(#'+id+'-steel)'} />
              </g>
              <path d={view.route} fill="none" stroke="#ffb850" strokeWidth="1.2" strokeOpacity=".68"
                strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </defs>
          <use href={'#'+id+'-machine'} />
          <path className={s.movingParts} d={view.route} style={{animationPlayState: running && visible ? 'running' : 'paused'}} />
        </svg>}
      </div>
    </div>
    <p className={s.status} role="status">{failed ? label('动画暂时无法播放。', 'Animation could not be loaded.') : selected !== null && (tracked ? steps[selected] + ' · ' + tracked.stages[selected].note : steps[selected])}</p>
    <div className={s.tray}>
      <p className={s.instruction} id={id+'-label'}><FiGrid aria-hidden />
        {label('点选下方工序卡片，查看局部动画', 'Select a process card to view its animation')}
      </p>
      <div className={s.cards} data-stages={steps.length} role="group" aria-labelledby={id+'-label'}
        style={{ '--stages': steps.length } as CSSProperties}>
        {steps.map((step, i) => <button key={step} type="button" className={s.card} disabled={!ready} aria-controls={id}
          aria-pressed={selected === i} onClick={() => selectStage(i)}>
          <span className={s.thumb}>
            {tracked && <img src={tracked.stages[i].thumb} alt="" width={540} height={234} />}
            {view && <svg viewBox={detailFrame(view.cameras[i], 450/195, sceneHeight).join(' ')} aria-hidden="true">
              {film ? <image href={film + '.webp'} width="1000" height={sceneHeight} /> : <use href={'#'+id+'-machine'} />}
            </svg>}
            <span className={s.magnifier}><FiZoomIn aria-hidden /></span>
          </span>
          <span className={s.caption}>{step}{selected === i ? <FiCheck aria-hidden /> : <FiChevronRight aria-hidden />}</span>
        </button>)}
      </div>
    </div>
  </div>;
}
