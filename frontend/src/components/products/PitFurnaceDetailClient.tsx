'use client';

import Image from 'next/image';
import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

import styles from './PitFurnaceDetailPage.module.css';

export type PitFurnaceGalleryImage = {
  src: string;
  alt: string;
  caption: string;
  unoptimized?: boolean;
};

export type PitFurnaceFaqItem = {
  question: string;
  answer: string;
};

export function PitFurnaceGallery({
  images,
  galleryLabel = '井式炉图片选择',
  imageButtonPrefix = '查看图片',
}: {
  images: PitFurnaceGalleryImage[];
  galleryLabel?: string;
  imageButtonPrefix?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) return null;

  return (
    <div className={styles.gallery}>
      <figure className={styles.galleryMain}>
        <Image
          src={activeImage.src}
          unoptimized={activeImage.unoptimized}
          alt={activeImage.alt}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className={styles.galleryMainImage}
          data-pit-gallery-main-image
          data-furnace-gallery-main-image
        />
        <figcaption className={styles.galleryCaption}>{activeImage.caption}</figcaption>
      </figure>

      <div className={styles.galleryThumbs} aria-label={galleryLabel}>
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`${imageButtonPrefix}：${image.caption}`}
            aria-pressed={activeIndex === index}
            data-pit-gallery-thumb={index + 1}
            data-furnace-gallery-thumb={index + 1}
            className={`${styles.galleryThumb} ${activeIndex === index ? styles.galleryThumbActive : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={image.src}
              unoptimized={image.unoptimized}
              alt=""
              fill
              sizes="(min-width: 1024px) 160px, 24vw"
              className={styles.galleryThumbImage}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function PitFurnaceFaq({
  items,
  idPrefix = 'pit-furnace',
}: {
  items: PitFurnaceFaqItem[];
  idPrefix?: string;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className={styles.faqList}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const answerId = `${idPrefix}-faq-answer-${index + 1}`;

        return (
          <article key={item.question} className={styles.faqItem}>
            <h3>
              <button
                type="button"
                className={styles.faqButton}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span className={styles.faqNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <span>{item.question}</span>
                <HiChevronDown
                  aria-hidden="true"
                  className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}
                />
              </button>
            </h3>
            <div
              id={answerId}
              className={`${styles.faqAnswerWrap} ${isOpen ? styles.faqAnswerWrapOpen : ''}`}
            >
              <div>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function PitResourceTabs({ label, equipmentLabel, resourcesLabel, equipment, resources }: {
  label: string;
  equipmentLabel: string;
  resourcesLabel: string;
  equipment: ReactNode;
  resources: ReactNode;
}) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const tabs = [equipmentLabel, resourcesLabel];

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        next = 1 - index;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelected(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <>
      <div role="tablist" aria-label={label} className={styles.resourceTabs}>
        {tabs.map((title, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={event => navigate(event, index)}
          >
            {title}
          </button>
        ))}
      </div>
      {[equipment, resources].map((content, index) => (
        <div key={index} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`}
          hidden={selected !== index} tabIndex={index === 0 ? 0 : undefined}>
          {content}
        </div>
      ))}
    </>
  );
}
