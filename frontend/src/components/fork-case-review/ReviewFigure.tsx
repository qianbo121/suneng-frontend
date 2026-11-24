'use client';

import { useRef, useState } from 'react';
import { FiArrowUpRight, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import './figure-viewer.css';

export function ReviewFigure({ figure, english = false }: { english?: boolean; figure: { src: string; alt: string; caption: string } }) {
  const opener = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [enlarged, setEnlarged] = useState(false);
  return <div className="fork-review-figure">
    <figure className="fork-figure-row">
      <button type="button" ref={opener} data-open="figure" aria-haspopup="dialog" aria-label={(english ? 'Open diagram: ' : '查看技术图，') + figure.alt}
        onClick={() => dialog.current?.showModal()}>
        <img src={figure.src} alt="" loading="lazy" />
        <span>{english ? 'View diagram' : '查看技术图'} <FiArrowUpRight aria-hidden /></span>
      </button>
      <figcaption><strong>{figure.alt}</strong><p>{figure.caption}</p></figcaption>
    </figure>
    <dialog ref={dialog} className="fork-figure-dialog" aria-labelledby="fork-figure-title"
      onClose={() => {
        setEnlarged(false);
        opener.current?.focus({ preventScroll: true });
      }}
      onClick={e => { if (e.target === e.currentTarget) {
        const b = e.currentTarget.getBoundingClientRect();
        if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.current?.close();
      } }}>
      <div className="fork-figure-toolbar">
        <h2 id="fork-figure-title">{figure.alt}</h2>
        <button type="button" aria-pressed={enlarged} onClick={() => setEnlarged(!enlarged)}>
          {enlarged ? <FiZoomOut /> : <FiZoomIn />}{enlarged ? (english ? 'Fit to screen' : '适应屏幕') : (english ? 'Zoom in' : '放大')}
        </button>
        <button type="button" aria-label={english ? "Close diagram" : "关闭技术图"} onClick={() => dialog.current?.close()}><FiX /></button>
      </div>
      <div className="fork-figure-surface" data-enlarged={enlarged} tabIndex={enlarged ? 0 : -1} aria-label={english ? "Technical diagram" : "技术图"}>
        <img src={figure.src} alt={figure.alt} />
      </div>
      <a className="fork-original" href={figure.src} target="_blank" rel="noopener noreferrer">{english ? 'Open original in a new window' : '查看原图（新窗口）'}</a>
    </dialog>
  </div>;
}
