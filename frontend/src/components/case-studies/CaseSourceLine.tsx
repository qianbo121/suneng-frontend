import { chineseCaseIntro } from '@/lib/cases/chinese-intros';

export function CaseSourceLine({ slug, className }: { slug: string; className: string }) {
  const label = chineseCaseIntro(slug)?.sourceLabel;
  return label ? <p data-case-source="" className={className}>{label}</p> : null;
}
