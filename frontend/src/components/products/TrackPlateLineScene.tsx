'use client';

import { useEffect, useRef } from 'react';
import styles from './TrackPlateLinePreview.module.css';

type SceneModule = {
  mountTrackPlateLine: (options: {
    canvas: HTMLCanvasElement;
    reducedMotion: boolean;
    onReady: () => void;
    onError: () => void;
    onStage: (stage: number) => void;
    onComplete: () => void;
  }) => { dispose: () => void };
};
let modulePromise: Promise<SceneModule> | undefined;
function loadScene() {
  const source = '/animations/production-lines/v1/track-plate.js?v=mechanical-fix-20260914-3';
  modulePromise ??= (import(/* webpackIgnore: true */ source) as Promise<SceneModule>).catch(
    (error) => {
      modulePromise = undefined;
      throw error;
    },
  );
  return modulePromise;
}

export function TrackPlateLineScene({
  reducedMotion,
  onReady,
  onError,
  onStage,
  onComplete,
}: {
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
    canvas.setAttribute(
      'aria-label',
      '履带板生产线三维演示：加热、转移定位、模压淬火、回火冷却与检验',
    );
    container.append(canvas);
    void loadScene()
      .then((module) => {
        if (cancelled) return;
        controller = module.mountTrackPlateLine({
          canvas,
          reducedMotion,
          onReady: () => {
            if (!cancelled) callbacks.current.onReady();
          },
          onError: () => {
            if (!cancelled) callbacks.current.onError();
          },
          onStage: (stage) => {
            if (!cancelled) callbacks.current.onStage(stage);
          },
          onComplete: () => {
            if (!cancelled) callbacks.current.onComplete();
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
  }, [reducedMotion]);
  return <div ref={root} className={styles.scene} />;
}
