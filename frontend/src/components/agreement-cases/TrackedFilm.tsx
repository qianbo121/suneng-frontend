'use client';

import { useEffect, type RefObject } from 'react';
import styles from './LineFlow.module.css';

export type FilmTrack = {
  width: number; height: number; duration: number; cycleDuration: number; stageDuration: number;
  composedShots?: boolean; referenceFraming?: boolean; passCount: number; anchors: number[]; tracks: [number, number, number][];
};
export type TrackedProject = {
  directory: string; track: FilmTrack; stages: { title: string; note: string; thumb: string }[];
};

type Props = {
  project: TrackedProject; player: RefObject<HTMLVideoElement>;
  selection: { index: number | null; moving: boolean }; title: string;
  onError: () => void; onBuffering: (waiting: boolean) => void;
};

// Keep the moving load in frame. Each operation has its own loop within the complete film.
export function TrackedFilm({ project, player, selection, title, onError, onBuffering }: Props) {
  const { directory, track } = project;
  useEffect(() => {
    const video = player.current;
    if (!video?.parentElement) return;
    // The browser may start the server-rendered media request before React attaches its listeners.
    onBuffering(video.readyState < 2 && video.networkState === 2);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      video.preload = 'auto';
      if (video.readyState < 2) onBuffering(true);
      observer.disconnect();
    }, { rootMargin: '500px 0px' });
    observer.observe(video.parentElement);
    return () => observer.disconnect();
  }, [player, directory, onBuffering]);
  useEffect(() => {
    const video = player.current;
    const screen = video?.parentElement;
    if (!video || !screen) return;
    const { index, moving } = selection;
    const pass = Math.min(track.passCount - 1, Math.floor(video.currentTime / track.cycleDuration));
    const passStart = pass * track.cycleDuration;
    const start = passStart + (index ?? 0) * track.stageDuration;
    let callback: number | undefined;

    function frame(time: number) {
      const w = screen!.clientWidth, h = screen!.clientHeight;
      if (!w || !h) return;
      let scale = Math.min(w / track.width, h / track.height), x = .5, y = .5;
      if (index === null && track.referenceFraming) {
        scale = w / track.width;
        y = .52;
      }
      if (index !== null) {
        const at = Math.min(Math.max(time, 0) / track.duration * track.tracks.length, track.tracks.length - 1);
        const cursor = Math.floor(at), fraction = at - cursor;
        const a = track.tracks[cursor], b = track.tracks[Math.min(cursor + 1, track.tracks.length - 1)];
        x = a[0] + (b[0] - a[0]) * fraction;
        y = a[1] + (b[1] - a[1]) * fraction;
        const cropWidth = track.width * (a[2] + (b[2] - a[2]) * fraction);
        const cropHeight = Math.min(track.height, cropWidth / 2.5);
        // Fit the existing close-up inside the fixed window, including the full load and carriage.
        scale = track.referenceFraming ? Math.min(w / cropWidth, h / cropHeight) : Math.max(scale, w / cropWidth);
      }
      const sw = track.width * scale, sh = track.height * scale;
      const offset = (size: number, image: number, center: number) => image <= size
        ? (size - image) / 2 : Math.max(size - image, Math.min(0, size / 2 - center * image));
      Object.assign(video!.style, { width: sw + 'px', height: sh + 'px', transform: 'translate(' + offset(w, sw, x) + 'px,' + offset(h, sh, y) + 'px)' });
    }
    function draw() { frame(video!.currentTime); }
    function select() {
      if (index !== null) video!.currentTime = moving ? start : passStart + track.anchors[index];
      draw();
    }
    function tick(time: number) {
      if (index !== null && !video!.seeking && !video!.paused &&
          (time >= start + track.stageDuration - .025 || time < start - .16)) video!.currentTime = start;
      else if (!video!.seeking) frame(time);
    }
    function schedule() {
      if (callback !== undefined || video!.paused || !video!.requestVideoFrameCallback) return;
      callback = video!.requestVideoFrameCallback((_, metadata) => {
        callback = undefined;
        tick(metadata.mediaTime);
        schedule();
      });
    }
    function fallback() { if (!video!.requestVideoFrameCallback) tick(video!.currentTime); }
    // A loop can finish exactly on the final frame before the frame callback runs.
    function ended() { if (index !== null) { video!.currentTime = start; video!.play().catch(() => {}); } }
    const listeners = { loadedmetadata: select, seeked: draw, playing: schedule, timeupdate: fallback, ended };
    for (const [event, fn] of Object.entries(listeners)) video.addEventListener(event, fn);
    const observer = new ResizeObserver(draw);
    observer.observe(screen);
    if (video.readyState >= 1) select();
    else if (index !== null) video.preload = 'metadata';
    draw();
    schedule();
    return () => {
      observer.disconnect();
      for (const [event, fn] of Object.entries(listeners)) video.removeEventListener(event, fn);
      if (callback !== undefined) video.cancelVideoFrameCallback(callback);
    };
  }, [track, selection, player]);

  return <video className={styles.trackedFilm} ref={player} src={directory + '/line.mp4'}
    poster={directory + '/poster.jpg'} width={track.width} height={track.height}
    muted loop={selection.index === null} playsInline preload="metadata" aria-label={title}
    onLoadStart={() => onBuffering(true)} onWaiting={() => onBuffering(true)} onSeeking={() => onBuffering(true)}
    onLoadedData={() => onBuffering(false)} onCanPlay={() => onBuffering(false)} onPlaying={() => onBuffering(false)}
    onSeeked={() => { if (player.current && player.current.readyState >= 2) onBuffering(false); }}
    onError={() => { onBuffering(false); onError(); }} />;
}
