'use client';

import { useRef, useState } from 'react';
import styles from './AboutHeroVideo.module.css';

const VIDEO_SRC = '/videos/about/suneng-factory-20260808.mp4';
const POSTER_SRC = '/videos/about/suneng-factory-20260808-poster.jpg';

export function AboutHeroVideo({
  className,
  caption = '走进苏能生产基地',
}: {
  className?: string;
  caption?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);

  const startPlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    setError(false);
    try {
      await video.play();
      setStarted(true);
    } catch {
      setError(true);
    }
  };

  return (
    <figure className={`${styles.figure} ${className ?? ''}`}>
      <div className={styles.frame} data-about-layout="video">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          preload="metadata"
          playsInline
          controls={started}
          className={styles.mainVideo}
          aria-label="苏能工业炉生产基地企业视频"
          aria-describedby="about-video-description"
          onError={() => setError(true)}
        />
        {!started ? (
          <button
            type="button"
            onClick={() => void startPlayback()}
            className={styles.playButton}
            aria-label="播放企业视频"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 2v20l17-10L5 2Z" />
            </svg>
          </button>
        ) : null}
      </div>
      <span id="about-video-description" className={styles.description}>
        视频展示生产基地外景、连续炉设备、车间制造装配及人员检查等画面。
      </span>
      {caption || error ? (
        <figcaption className={styles.caption}>
          {caption}
          {error ? (
            <span className={styles.error} role="status">
              视频暂时无法播放，请重试或<a href={VIDEO_SRC}>打开原视频</a>。
            </span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
