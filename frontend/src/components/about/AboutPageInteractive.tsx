'use client';

import Image from 'next/image';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { HiChevronDown, HiMinus, HiPlus, HiXMark } from 'react-icons/hi2';

import type {
  AboutAnchorItem,
  AboutBoundaryItem,
  AboutFaqItem,
} from '@/components/about/about-page-data';

import styles from './AboutZhContent.module.css';

type CertificateCard = {
  title: string;
  summary: string;
  detail: string;
  validUntil?: string;
  image: string;
  alt: string;
  linkLabel: string;
};

export function AboutAnchorNav({ items }: { items: AboutAnchorItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    let animationFrame = 0;
    const updateActiveSection = () => {
      const activationLine = Math.min(300, Math.max(176, window.innerHeight * 0.3));
      let currentSection = sections[0];

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine) currentSection = section;
        else break;
      }

      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        currentSection = sections[sections.length - 1];
      }

      if (currentSection?.id) setActiveId(currentSection.id);
    };
    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateActiveSection();
      });
    };

    const observer = new IntersectionObserver(scheduleUpdate, {
      rootMargin: '-156px 0px -65% 0px',
      threshold: [0, 0.01],
    });

    sections.forEach((section) => observer.observe(section));
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    updateActiveSection();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [items]);

  useEffect(() => {
    const centerActiveLink = () => {
      if (!window.matchMedia('(max-width: 767px)').matches) return;

      const scroller = scrollerRef.current;
      const activeLink = linkRefs.current[activeId];
      if (!scroller || !activeLink || scroller.scrollWidth <= scroller.clientWidth) return;

      const targetLeft = Math.max(
        0,
        Math.min(
          activeLink.offsetLeft - (scroller.clientWidth - activeLink.offsetWidth) / 2,
          scroller.scrollWidth - scroller.clientWidth,
        ),
      );
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scroller.scrollTo({ left: targetLeft, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    centerActiveLink();
    window.addEventListener('resize', centerActiveLink);
    return () => window.removeEventListener('resize', centerActiveLink);
  }, [activeId]);

  const handleAnchorClick = (event: ReactMouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.history.pushState(null, '', `#${sectionId}`);
    section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    setActiveId(sectionId);
  };

  return (
    <nav className={styles.anchorNav} aria-label="关于苏能页内导航">
      <div ref={scrollerRef} className={styles.anchorScroller} data-about-layout="anchor-nav">
        {items.map((item) => (
          <a
            key={item.id}
            ref={(element) => {
              linkRefs.current[item.id] = element;
            }}
            href={`#${item.id}`}
            className={styles.anchorLink}
            data-active={activeId === item.id ? 'true' : 'false'}
            aria-current={activeId === item.id ? 'location' : undefined}
            onClick={(event) => handleAnchorClick(event, item.id)}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function AboutBoundaryList({ items }: { items: AboutBoundaryItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const featuredTitles = [
    '感应加热设备',
    '炼钢与大型冶金炉',
    '工业锅炉与铸造熔化',
    '按件热处理加工',
    '燃烧器单件标',
    '特殊工艺认证',
  ];
  const orderedItems = [
    ...featuredTitles.flatMap((title) => items.filter((item) => item.title === title)),
    ...items.filter((item) => !featuredTitles.includes(item.title)),
  ];
  const displayTitles: Record<string, string> = {
    感应加热设备: '感应炉、中频炉',
    炼钢与大型冶金炉: '炼钢冶金炉',
    工业锅炉与铸造熔化: '锅炉',
    按件热处理加工: '热处理加工服务',
    燃烧器单件标: '燃烧器单件',
  };

  return (
    <div className={styles.boundaryPanel}>
      <div className={styles.boundaryHeading}>
        <div>
          <h3>承接范围说明</h3>
        </div>
        <p>提前核对设备与服务是否匹配。</p>
      </div>

      <ul id="about-boundary-list" className={styles.boundaryGrid}>
        {orderedItems.map((item, index) => (
          <li key={item.title} hidden={!expanded && index >= 6}>
            <strong>{displayTitles[item.title] ?? item.title}</strong>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.boundaryToggle}
        aria-expanded={expanded}
        aria-controls="about-boundary-list"
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? '收起完整边界清单' : `展开完整边界清单（${items.length} 类）`}
        <HiChevronDown
          aria-hidden="true"
          className={expanded ? styles.chevronExpanded : undefined}
        />
      </button>
    </div>
  );
}

export function AboutCertificateGrid({ cards }: { cards: CertificateCard[] }) {
  const [activeCard, setActiveCard] = useState<CertificateCard | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!activeCard) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setActiveCard(null);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      trigger?.focus();
    };
  }, [activeCard]);

  return (
    <>
      <div className={styles.certificateGrid} data-about-layout="certificates">
        {cards.map((card) => (
          <article key={card.title} className={styles.certificateCard}>
            <button
              type="button"
              className={styles.certificateImageButton}
              aria-label={`查看${card.title}大图`}
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setActiveCard(card);
              }}
            >
              <Image
                src={card.image}
                alt={card.alt}
                fill
                loading="lazy"
                sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1199px) 33vw, 360px"
                className={styles.certificateImage}
              />
              <span className={styles.viewImageHint}>点击查看大图</span>
            </button>
            <div className={styles.certificateBody}>
              <h3>{card.title}</h3>
              <p>{card.summary}</p>
              <span>{card.detail}</span>
              {card.validUntil ? (
                <span className={styles.certificateValidity}>有效期至：{card.validUntil}</span>
              ) : null}
              <button
                type="button"
                className={styles.certificateTextButton}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setActiveCard(card);
                }}
              >
                {card.linkLabel}
              </button>
            </div>
          </article>
        ))}
      </div>

      {activeCard ? (
        <div
          className={styles.lightboxBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setActiveCard(null);
          }}
        >
          <div
            ref={dialogRef}
            className={styles.lightboxDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-certificate-lightbox-title"
            aria-describedby="about-certificate-lightbox-description"
          >
            <div className={styles.lightboxHeader}>
              <div>
                <h2 id="about-certificate-lightbox-title">{activeCard.title}</h2>
                <p id="about-certificate-lightbox-description">{activeCard.detail}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className={styles.lightboxClose}
                aria-label="关闭证书大图"
                onClick={() => setActiveCard(null)}
              >
                <HiXMark aria-hidden="true" />
              </button>
            </div>
            <div className={styles.lightboxImageFrame}>
              <Image
                src={activeCard.image}
                alt={activeCard.alt}
                fill
                priority
                unoptimized
                sizes="(max-width: 767px) calc(100vw - 32px), 900px"
                className={styles.lightboxImage}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AboutFaq({ items }: { items: AboutFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowDown') nextIndex = (index + 1) % items.length;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={styles.faqList}>
      {items.map((item, index) => {
        const expanded = openIndex === index;
        const answerId = `about-faq-answer-${index}`;
        const buttonId = `about-faq-button-${index}`;

        return (
          <div
            key={item.question}
            className={styles.faqItem}
            data-open={expanded ? 'true' : 'false'}
          >
            <h3>
              <button
                ref={(element) => {
                  buttonRefs.current[index] = element;
                }}
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={answerId}
                onClick={() => setOpenIndex(expanded ? -1 : index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className={styles.faqNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.faqQuestion}>{item.question}</span>
                <span className={styles.faqToggle} aria-hidden="true">
                  {expanded ? <HiMinus /> : <HiPlus />}
                </span>
              </button>
            </h3>
            <div
              id={answerId}
              role="region"
              aria-labelledby={buttonId}
              className={styles.faqAnswer}
              hidden={!expanded}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
