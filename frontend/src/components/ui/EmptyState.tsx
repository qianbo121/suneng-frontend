import { Button } from '@/components/ui/Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="rounded-[30px] border border-dashed border-[rgba(0,75,151,0.18)] bg-white px-6 py-12 text-center shadow-soft">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(0,75,151,0.08)] text-sm uppercase tracking-[0.26em] text-brand-primary">
        Empty
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-neutral-900">{title}</h3>
      {description ? <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-neutral-700">{description}</p> : null}
      {actionLabel && actionHref ? (
        <div className="mt-6">
          <Button href={actionHref} variant="secondary">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
