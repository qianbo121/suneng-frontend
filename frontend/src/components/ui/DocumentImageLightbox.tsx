'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './DocumentImageLightbox.module.css';

export function DocumentImageLightbox({
  images,
  imageAlts = [],
  initialIndex = 0,
  onClose,
  locale = 'zh',
}: {
  images: string[];
  imageAlts?: string[];
  initialIndex?: number;
  onClose: () => void;
  locale?: 'zh' | 'en';
}) {
  const english = locale === 'en';
  const originalLabel = english ? 'View Original' : '查看原件';
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  const changeIndex = (next: number) => {
    setIndex(next);
    setZoomed(false);
  };
  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={imageAlts[index] || originalLabel}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.content}>
        <div className={styles.toolbar}>
          <span>{imageAlts[index] || originalLabel}</span>
          <button type="button" onClick={() => setZoomed(!zoomed)} aria-pressed={zoomed}>
            {english ? (zoomed ? 'Zoom Out' : 'Zoom In') : (zoomed ? '缩小' : '放大')}
          </button>
          <button type="button" onClick={onClose} aria-label={english ? 'Close original preview' : '关闭原件预览'}>
            {english ? 'Close ×' : '关闭 ×'}
          </button>
        </div>
        <div className={styles.viewport}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={imageAlts[index] || (english ? 'Original document' : '原件')}
            className={zoomed ? styles.zoomed : styles.image}
          />
        </div>
        <div className={styles.bottom}>
          {images.length > 1 && (
            <>
              <button type="button" disabled={index === 0} onClick={() => changeIndex(index - 1)}>
                {english ? 'Previous' : '上一张'}
              </button>
              <span>
                {index + 1} / {images.length}
              </span>
              <button
                type="button"
                disabled={index === images.length - 1}
                onClick={() => changeIndex(index + 1)}
              >
                {english ? 'Next' : '下一张'}
              </button>
            </>
          )}
          <a href={images[index]} target="_blank" rel="noopener noreferrer">
            {english ? 'Open Original ↗' : '打开原图 ↗'}
          </a>
        </div>
      </div>
    </dialog>
  );
}
