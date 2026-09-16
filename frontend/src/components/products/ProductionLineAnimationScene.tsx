'use client';

import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import styles from './TrackPlateLinePreview.module.css';
import built from '@/lib/production-line-animation-revision.json';

type SceneModule = {
  mountTrackPlateLine: (options: {
    canvas: HTMLCanvasElement;
    lineId: string;
    reducedMotion: boolean;
    onReady: () => void;
    onError: () => void;
    onStage: (stage: number) => void;
    onComplete: () => void;
  }) => { dispose: () => void };
};
let modulePromise: Promise<SceneModule> | undefined;
function loadScene() {
  const source = `/animations/production-lines/v1/all-lines.js?v=${built.revision}`;
  modulePromise ??= (import(/* webpackIgnore: true */ source) as Promise<SceneModule>).catch(
    (error) => {
      modulePromise = undefined;
      throw error;
    },
  );
  return modulePromise;
}

export function ProductionLineAnimationScene({
  lineId,
  title,
  locale = 'zh',
  reducedMotion,
  onReady,
  onError,
  onStage,
  onComplete,
}: {
  lineId: string;
  title: string;
  locale?: 'zh' | 'en';
  reducedMotion: boolean;
  onReady: () => void;
  onError: () => void;
  onStage: (stage: number) => void;
  onComplete: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onError, onStage, onComplete });
  callbacks.current = { onReady, onError, onStage, onComplete };
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    let cancelled = false;
    let controller: { dispose: () => void } | undefined;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', locale === 'en' ? `${title} 3D process demonstration` : `${title}三维工艺流程演示`);
    container.append(canvas);
    void loadScene()
      .then((module) => {
        if (cancelled) return;
        controller = module.mountTrackPlateLine({
          canvas,
          lineId,
          reducedMotion,
          onReady: () => {
            if (!cancelled) callbacks.current.onReady();
          },
          onError: () => {
            if (!cancelled) callbacks.current.onError();
          },
          onStage: (stage) => {
            if (!cancelled) flushSync(() => callbacks.current.onStage(stage));
          },
          onComplete: () => {
            if (!cancelled) flushSync(() => callbacks.current.onComplete());
          },
        });
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onError();
      });
    return () => {
      cancelled = true;
      controller?.dispose();
      canvas.remove();
    };
  }, [lineId, title, locale, reducedMotion]);
  return <div ref={root} className={styles.scene} />;
}
