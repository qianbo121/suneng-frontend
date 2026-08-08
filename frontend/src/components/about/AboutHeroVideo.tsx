'use client';

import { useRef, useState } from 'react';

const VIDEO_SRC = '/videos/about/suneng-factory-20260808.mp4';
const POSTER_SRC = '/videos/about/suneng-factory-20260808-poster.jpg';

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function AboutHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => setIsPlaying(false));
      return;
    }

    video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const seekTo = (nextTime: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div className="group relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden bg-black lg:mx-0 lg:h-full lg:max-w-none">
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        preload="metadata"
        playsInline
        disablePictureInPicture
        controlsList="nodownload noremoteplayback nofullscreen"
        className="h-full w-full cursor-pointer object-cover"
        aria-label="苏能工业炉生产基地企业视频"
        onClick={togglePlayback}
        onPlay={(event) => {
          setIsPlaying(true);
          setDuration(event.currentTarget.duration);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => {
          setCurrentTime(event.currentTarget.currentTime);
          setDuration(event.currentTarget.duration);
        }}
      />

      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-[#101828]/72 text-white shadow-[0_10px_32px_rgba(16,24,40,0.32)] backdrop-blur-sm transition hover:scale-105 hover:bg-[#101828]/86 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-label={currentTime > 0 ? '继续播放企业视频' : '播放企业视频'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-1 h-7 w-7 fill-current">
            <path d="M8 5.4v13.2L18.5 12 8 5.4Z" />
          </svg>
        </button>
      )}

      {currentTime > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 via-black/42 to-transparent px-4 pb-4 pt-12 text-white opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={togglePlayback}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 transition hover:bg-white/22 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label={isPlaying ? '暂停企业视频' : '继续播放企业视频'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 h-5 w-5 fill-current">
                <path d="M8 5.4v13.2L18.5 12 8 5.4Z" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={Math.max(duration, 0)}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seekTo(Number(event.currentTarget.value))}
            className="h-1 min-w-0 flex-1 cursor-pointer accent-[#e60012]"
            aria-label="视频播放进度"
          />

          <span className="shrink-0 text-[12px] font-medium tabular-nums text-white/86">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={toggleMute}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 transition hover:bg-white/22 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label={isMuted ? '打开视频声音' : '静音企业视频'}
          >
            {isMuted ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 fill-none stroke-current stroke-[1.8]"
              >
                <path d="M5 9v6h4l5 4V5L9 9H5Z" />
                <path d="m17 9 4 4m0-4-4 4" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 fill-none stroke-current stroke-[1.8]"
              >
                <path d="M5 9v6h4l5 4V5L9 9H5Z" />
                <path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
