import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Locale, LocalizedText } from '@/types/site';

export type AboutStatsPanelItem = {
  key: string;
  icon: string;
  label: LocalizedText;
  value: LocalizedText;
  unit?: LocalizedText;
};

type AboutStatsPanelProps = {
  locale: Locale;
  items: AboutStatsPanelItem[];
  className?: string;
  dataAboutStats?: boolean;
  backgroundImage?: string;
  overlayClassName?: string;
  iconSize?: number;
  itemClassName?: string;
  separatorInset?: number;
  separatorClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  unitClassName?: string;
};

export function AboutStatsPanel({
  locale,
  items,
  className,
  dataAboutStats = false,
  backgroundImage = '/images/home/hero-industrial-furnace-banner-hd.png',
  overlayClassName = 'bg-black/90',
  iconSize = 40,
  itemClassName,
  separatorInset = 40,
  separatorClassName = 'bg-white/20',
  labelClassName,
  valueClassName,
  unitClassName,
}: AboutStatsPanelProps) {
  return (
    <div data-about-stats={dataAboutStats ? true : undefined} className={cn('relative overflow-hidden bg-black', className)}>
      <Image src={backgroundImage} alt="" fill className="object-cover" sizes="100vw" />
      <div className={cn('absolute inset-0', overlayClassName)} />
      <div className="relative z-10 grid divide-y divide-white/20 md:grid-cols-4 md:divide-y-0">
        {items.map((item, index) => (
          <div
            key={item.key}
            className={cn('relative flex flex-col items-center justify-center px-5 text-center', itemClassName)}
          >
            {index < items.length - 1 ? (
              <span
                className={cn('absolute right-0 hidden w-px md:block', separatorClassName)}
                style={{ top: separatorInset, bottom: separatorInset }}
              />
            ) : null}
            <Image
              src={item.icon}
              alt=""
              width={iconSize}
              height={iconSize}
              className="object-contain"
              style={{ width: iconSize, height: iconSize }}
            />
            <p className={cn('mt-4 leading-none text-white', labelClassName)}>{item.label[locale]}</p>
            <p className={cn('mt-5 leading-none text-[var(--color-accent)]', valueClassName)}>
              {item.value[locale]}
              {item.unit ? <span className={cn('ml-1 align-baseline text-white', unitClassName)}>{item.unit[locale]}</span> : null}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
