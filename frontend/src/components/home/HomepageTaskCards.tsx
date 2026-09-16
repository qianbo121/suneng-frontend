'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { HiArrowRight } from 'react-icons/hi2';

import { TaskMotionDrawing, type TaskMotionHandle } from './TaskMotionDrawing';
import { taskMotionTime, type TaskMotionKind } from './task-motion';
import styles from './HomepageV2.module.css';

type TaskCard = {
  id: TaskMotionKind;
  title: string;
  description: string;
  href: string;
  imageAlt: string;
};
type Controller = {
  enter(index: number): void;
  leave(index: number): void;
  interrupt(): void;
  navigate(): void;
};

export function HomepageTaskCards({ items }: { items: readonly TaskCard[] }) {
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const drawings = useRef<(TaskMotionHandle | null)[]>([]);
  const controller = useRef<Controller | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 767px)');
    const visibility = new Map<number, number>();
    const visited = new Set<number>();
    const introKey = 'suneng-home-task-motion-intro-v1';
    let introDone = false;
    try {
      introDone = sessionStorage.getItem(introKey) === 'done';
    } catch {
      /* Storage is optional. */
    }
    let active: number | null = null;
    let frame = 0;
    let pending = 0;
    let disposed = false;
    let navigationStarted = false;
    let introCursor = 0;

    const markIntroDone = () => {
      introDone = true;
      try {
        sessionStorage.setItem(introKey, 'done');
      } catch {
        /* Storage is optional. */
      }
    };
    const stop = (reset = true) => {
      cancelAnimationFrame(frame);
      window.clearTimeout(pending);
      frame = 0;
      pending = 0;
      if (active !== null) {
        const card = cards.current[active];
        if (card) {
          card.dataset.motionState = 'idle';
          card.dataset.motionProgress = '0';
        }
        if (reset) drawings.current[active]?.seek(0);
      }
      active = null;
    };
    const play = (index: number, introduction: boolean, finish?: () => void) => {
      if (disposed || navigationStarted || reduced.matches || document.hidden) return;
      stop();
      const card = cards.current[index];
      if (!card || (visibility.get(index) ?? 0) < 0.15) return;
      active = index;
      card.dataset.motionState = introduction ? 'introduction' : 'playing';
      const duration = introduction ? 1400 : 4800;
      const started = performance.now();
      const tick = (now: number) => {
        if (active !== index || disposed) return;
        const progress = Math.min(1, (now - started) / duration);
        drawings.current[index]?.seek(taskMotionTime(items[index].id, progress, introduction));
        card.dataset.motionProgress = progress.toFixed(3);
        if (progress < 1) frame = requestAnimationFrame(tick);
        else {
          card.dataset.motionState = 'idle';
          active = null;
          frame = 0;
          if (finish) pending = window.setTimeout(finish, 120);
        }
      };
      frame = requestAnimationFrame(tick);
    };
    const playMobile = () => {
      if (
        !mobile.matches ||
        reduced.matches ||
        active !== null ||
        disposed ||
        navigationStarted ||
        document.hidden
      )
        return;
      const eligible = [...visibility.entries()].filter(
        ([index, ratio]) => ratio >= 0.6 && !visited.has(index),
      );
      eligible.sort(([a], [b]) => {
        const ra = cards.current[a]?.getBoundingClientRect(),
          rb = cards.current[b]?.getBoundingClientRect();
        return (
          Math.abs((ra ? ra.top + ra.height / 2 : Infinity) - innerHeight / 2) -
          Math.abs((rb ? rb.top + rb.height / 2 : Infinity) - innerHeight / 2)
        );
      });
      const index = eligible[0]?.[0];
      if (index === undefined) return;
      visited.add(index);
      play(index, false, playMobile);
    };
    const playIntroduction = () => {
      if (
        introDone ||
        mobile.matches ||
        active !== null ||
        reduced.matches ||
        disposed ||
        navigationStarted ||
        document.hidden
      )
        return;
      if (introCursor < items.length && (visibility.get(introCursor) ?? 0) < 0.6) return;
      if (introCursor >= items.length) {
        markIntroDone();
        return;
      }
      const index = introCursor++;
      play(index, true, playIntroduction);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cards.current.indexOf(entry.target as HTMLAnchorElement);
          if (index >= 0) visibility.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        if (active !== null && (visibility.get(active) ?? 0) < 0.15) stop();
        if (mobile.matches) playMobile();
        else playIntroduction();
      },
      { rootMargin: '-76px 0px -96px 0px', threshold: [0, 0.15, 0.35, 0.6, 0.85, 1] },
    );
    cards.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    controller.current = {
      enter(index) {
        if (mobile.matches || reduced.matches) return;
        markIntroDone();
        play(index, false);
      },
      leave(index) {
        if (active === index) stop();
      },
      interrupt() {
        markIntroDone();
        stop();
      },
      navigate() {
        navigationStarted = true;
        markIntroDone();
        stop();
      },
    };
    const onVisibility = () => {
      if (document.hidden) {
        if (active !== null && !mobile.matches) markIntroDone();
        stop();
      } else if (mobile.matches) playMobile();
    };
    const onPreference = () => {
      stop();
      if (reduced.matches) {
        markIntroDone();
        drawings.current.forEach((drawing) => drawing?.seek(0));
      } else if (mobile.matches) playMobile();
      else playIntroduction();
    };
    const onPageShow = () => {
      navigationStarted = false;
    };
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', onPreference);
    mobile.addEventListener('change', onPreference);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', onPreference);
      mobile.removeEventListener('change', onPreference);
      window.removeEventListener('pageshow', onPageShow);
      controller.current = null;
    };
  }, [items]);

  return (
    <div className={styles.taskGrid} data-task-motion-grid>
      {items.map((item, index) => (
        <Link
          key={item.id}
          href={item.href}
          className={styles.taskCard}
          ref={(element) => {
            cards.current[index] = element;
          }}
          data-task-motion={item.id}
          data-motion-state="idle"
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') controller.current?.enter(index);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== 'touch') controller.current?.leave(index);
          }}
          onFocus={() => controller.current?.enter(index)}
          onBlur={() => controller.current?.leave(index)}
          onPointerDown={() => controller.current?.interrupt()}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
              controller.current?.interrupt();
            else controller.current?.navigate();
          }}
        >
          <div className={styles.taskCardHeader}>
            <h3>{item.title}</h3>
            <span className={styles.taskArrow} aria-hidden="true">
              <HiArrowRight />
            </span>
            <p>{item.description}</p>
          </div>
          <div className={styles.taskIllustration}>
            <TaskMotionDrawing
              ref={(element) => {
                drawings.current[index] = element;
              }}
              kind={item.id}
              label={item.imageAlt}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
