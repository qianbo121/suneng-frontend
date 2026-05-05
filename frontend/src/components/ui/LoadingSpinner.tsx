import { cn } from '@/lib/utils';

type LoadingSpinnerProps = {
  className?: string;
};

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-[rgba(0,75,151,0.2)] border-t-brand-primary',
        className,
      )}
    />
  );
}
