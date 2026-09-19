'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Page-local chapter highlighting; native links and disclosure elements stay usable without JS. */
export function ReviewedDocument({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const links = Array.from(
      root.current?.querySelectorAll<HTMLAnchorElement>('.section-nav a, .toc a') ?? [],
    );
    const sections = [...new Set(links.map((link) => link.hash.slice(1)))]
      .map((id) =>
        Array.from(root.current?.querySelectorAll<HTMLElement>('[id]') ?? []).find(
          (section) => section.id === id,
        ),
      )
      .filter((section): section is HTMLElement => Boolean(section));
    let frame = 0;
    const update = () => {
      frame = 0;
      let active = sections[0]?.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 190) active = section.id;
      }
      for (const link of links) {
        const current = link.hash === `#${active}`;
        link.classList.toggle('current', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
