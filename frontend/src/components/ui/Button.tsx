import Link from 'next/link';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

function getButtonClass(variant: SharedProps['variant'], size: SharedProps['size']) {
  return cn(
    'inline-flex items-center justify-center rounded-full font-medium transition duration-200',
    size === 'sm' && 'min-h-[40px] px-4 text-sm',
    size === 'md' && 'min-h-[46px] px-6 text-sm',
    size === 'lg' && 'min-h-[52px] px-7 text-[15px]',
    variant === 'primary' &&
      'bg-brand-primary text-white shadow-[0_12px_24px_rgba(0,75,151,0.18)] hover:bg-brand-soft',
    variant === 'secondary' &&
      'border border-brand-primary text-brand-primary hover:bg-[rgba(0,75,151,0.05)]',
    variant === 'text' && 'rounded-none px-0 text-brand-primary hover:text-brand-accent',
  );
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  href,
  ...props
}: ButtonProps | LinkButtonProps) {
  const buttonClass = cn(getButtonClass(variant, size), className);

  if (href) {
    const linkProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;

    return (
      <Link href={href} className={buttonClass} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClass} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
