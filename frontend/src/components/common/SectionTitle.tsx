import { cn } from '@/lib/utils';

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionTitleProps) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      <p className="text-xs uppercase tracking-[0.36em] text-brand-accent">{eyebrow}</p>
      <div
        className={cn(
          'mt-4 flex items-center gap-3',
          align === 'center' ? 'justify-center' : 'justify-start',
        )}
      >
        <span className="h-px w-10 bg-brand-accent" />
        <span className="h-px w-16 bg-[rgba(0,75,151,0.3)]" />
      </div>
      <h2 className="mt-5 text-3xl font-semibold tracking-[0.04em] text-neutral-900 lg:text-[40px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-8 text-neutral-700">{description}</p>
      ) : null}
    </div>
  );
}
