'use client';

import Image from 'next/image';
import { type RefObject, useEffect, useRef, useState } from 'react';

import { type FurnaceAnimationKind, homeSingleFurnaces } from '@/lib/home-product-types';

import styles from './FurnaceAnimation.module.css';

type SceneController = { dispose: () => void };
type SceneModule = {
  mountFurnaceScene: (options: {
    canvas: HTMLCanvasElement;
    kind: FurnaceAnimationKind;
    reducedMotion: boolean;
    preview?: boolean;
    onComplete?: () => void;
    onReady: () => void;
    onError: () => void;
  }) => SceneController;
};

let sceneModule: Promise<SceneModule> | undefined;
function loadScene() {
  const source = '/animations/furnaces/v3/renderer.js?v=nitriding-sealed-flow-20260910-2';
  sceneModule ??= (import(/* webpackIgnore: true */ source) as Promise<SceneModule>).catch(
    (error) => {
      sceneModule = undefined;
      throw error;
    },
  );
  return sceneModule;
}

// Fetch the shared module before the pointer reaches a card, without creating canvases.
export function useFurnaceAnimationPreload(target: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void loadScene().catch(() => {});
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);
}

type FurnaceAnimationProps = {
  locale?: 'zh' | 'en';
  kind: FurnaceAnimationKind;
  label: string;
  active?: boolean;
  image?: string;
  touchCaption?: boolean;
  className?: string;
  preview?: boolean;
  onReady?: () => void;
  onComplete?: () => void;
  onError?: () => void;
};

export function FurnaceAnimation({
  locale = 'zh',
  kind,
  label,
  active = false,
  image,
  touchCaption = false,
  className = '',
  preview = false,
  onReady,
  onComplete,
  onError,
}: FurnaceAnimationProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useFurnaceAnimationPreload(rootRef);
  const callbacks = useRef({ onReady, onComplete, onError });
  callbacks.current = { onReady, onComplete, onError };
  const [inView, setInView] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle');
  const fallback = image ?? homeSingleFurnaces.find((item) => item.animationKind === kind)?.image;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!active || !inView || !root) {
      setState('idle');
      return;
    }
    let cancelled = false;
    let generation = 0;
    let controller: SceneController | undefined;
    let canvas: HTMLCanvasElement | undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const start = () => {
      const request = ++generation;
      const startedAt = performance.now();
      controller?.dispose();
      controller = undefined;
      canvas?.remove();
      // A fresh canvas avoids reusing a context explicitly released on a prior activation.
      canvas = document.createElement('canvas');
      canvas.className = styles.canvas;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', kind === 'nitriding'
        ? locale === 'en'
          ? `${label}: sealed retort internals and gas circulation`
          : `${label}：密封炉罐内部结构与气流示意`
        : label);
      root.append(canvas);
      setState('loading');
      void loadScene()
        .then((module) => {
          if (cancelled || request !== generation || !canvas) return;
          controller = module.mountFurnaceScene({
            canvas,
            kind,
            reducedMotion: motion.matches,
            preview,
            onComplete: () => {
              if (!cancelled && request === generation) callbacks.current.onComplete?.();
            },
            onReady: () => {
              if (!cancelled && request === generation) {
                if (canvas && !canvas.dataset.readyMs) {
                  canvas.dataset.readyMs = String(Math.round(performance.now() - startedAt));
                  callbacks.current.onReady?.();
                }
                setState('ready');
              }
            },
            onError: () => {
              if (!cancelled && request === generation) {
                setState('fallback');
                callbacks.current.onError?.();
              }
            },
          });
        })
        .catch(() => {
          if (!cancelled && request === generation) {
            setState('fallback');
            callbacks.current.onError?.();
          }
        });
    };
    start();
    motion.addEventListener('change', start);
    return () => {
      cancelled = true;
      ++generation;
      motion.removeEventListener('change', start);
      controller?.dispose();
      canvas?.remove();
    };
  }, [active, inView, kind, label, locale, preview]);

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${className}`.trim()}
      data-state={state}
      data-scene-kind={kind}
      data-touch-caption={touchCaption || undefined}
    >
      {fallback ? (
        <Image
          src={fallback}
          alt=""
          fill
          sizes="(max-width: 767px) 50vw, 25vw"
          unoptimized={kind === 'pusher' || kind === 'mesh'}
          className={styles.fallback}
          aria-hidden="true"
        />
      ) : null}
      {kind === 'nitriding' && state === 'ready' ? (
        <p className={styles.sceneCaption}>
          <strong>{locale === 'en' ? 'Internal arrangement' : '内部结构示意'}</strong>
          <span>{locale === 'en' ? 'Sealed retort · Gas circulation' : '炉罐密封 · 气体循环'}</span>
        </p>
      ) : null}
    </div>
  );
}
