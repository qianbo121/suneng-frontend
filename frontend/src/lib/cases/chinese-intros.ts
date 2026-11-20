import 'server-only';
import intros from '../../../content/case-intros.zh.json';

type CaseIntro = {
  sourceLabel: string;
  title: string;
  summary: string;
  listTitle: string;
  listSummary: string;
  sectionTitles?: Readonly<Record<string, string>>;
  presentation?: {
    conditionsHeading: string;
    work: string[];
    features: string[][];
    faqIntro: string;
    faq: string[][];
  };
};

export function chineseCaseIntro(slug: string): CaseIntro | undefined {
  if (!Object.hasOwn(intros, slug)) return undefined;
  return intros[slug as keyof typeof intros];
}
