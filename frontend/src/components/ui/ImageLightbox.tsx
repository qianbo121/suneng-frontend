'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { HiChevronLeft, HiChevronRight, HiOutlineXMark } from 'react-icons/hi2';

type ImageLightboxProps = {
  images: string[];
  imageAlts?: string[];
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
};

export function ImageLightbox({
  images,
  imageAlts = [],
  isOpen,
  initialIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setIndex((prev) => Math.min(prev + 1, images.length - 1));
      if (event.key === 'ArrowLeft') setIndex((prev) => Math.max(prev - 1, 0));
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [images.length, isOpen, onClose]);

  if (!images.length) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#00162f]/88 px-4"
        >
          <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close lightbox" />
          <div className="relative z-[81] flex w-full max-w-5xl items-center gap-3">
            <button
              type="button"
              onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
              className="hidden h-12 w-12 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur md:flex"
            >
              <HiChevronLeft className="text-2xl" />
            </button>
            <motion.div
              key={images[index]}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative flex-1 overflow-hidden rounded-[28px] bg-white/6 p-3 backdrop-blur"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#00162f]/60 text-white"
              >
                <HiOutlineXMark className="text-2xl" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[index]}
                alt={imageAlts[index] || `Preview ${index + 1}`}
                className="max-h-[80vh] w-full rounded-[22px] object-contain"
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setIndex((prev) => Math.min(prev + 1, images.length - 1))}
              className="hidden h-12 w-12 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur md:flex"
            >
              <HiChevronRight className="text-2xl" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
