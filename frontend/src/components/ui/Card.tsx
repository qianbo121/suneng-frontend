import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type CardProps = {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  orientation?: 'vertical' | 'horizontal';
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function Card({
  title,
  description,
  image,
  imageAlt = '',
  orientation = 'vertical',
  footer,
  children,
  className,
}: CardProps) {
  return (
    <article
      className={cn(
        'overflow-hidden rounded-[28px] border border-[rgba(0,75,151,0.08)] bg-white shadow-soft',
        orientation === 'horizontal' ? 'grid md:grid-cols-[280px_minmax(0,1fr)]' : '',
        className,
      )}
    >
      {image ? (
        <div className={cn(orientation === 'horizontal' ? 'h-full min-h-[220px]' : 'h-[220px]')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="p-6 lg:p-7">
        {title ? <h3 className="text-xl font-semibold text-neutral-900">{title}</h3> : null}
        {description ? <p className="mt-3 text-sm leading-7 text-neutral-700">{description}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-6 border-t border-slate-100 pt-5">{footer}</div> : null}
      </div>
    </article>
  );
}
