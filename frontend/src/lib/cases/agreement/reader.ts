import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { getCaseArticle } from '../server';
import { getEnglishCase } from '../english';
import { chineseCaseIntro } from '../chinese-intros';
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from '../public-case-allowlist';

export type ProjectView = { animated?: boolean; top: number; height: number; cameras: [number, number, number][]; stageSeconds?: number[]; silhouette?: string; route?: string };
export type AgreementCase = {
  heroImage?: string;
  view?: ProjectView;
  seoTitle?: string; seoDescription?: string;
  datePublished?: string; dateModified?: string;
  slug: string; locale: string; title: string; heroAlt: string; summary: string; status: string; model?: string;
  figureHeading?: string; conditionsHeading?: string; processCaption?: string; metrics: string[][]; note: string; work: string[]; features: string[][]; flow: string[];
  params: string[][]; supplier: string; buyer: string; scope: string; pre: string; site: string;
  faq: string[][]; source: string; faqIntro: string;
};

export function readAgreement(locale: string, slug: string): AgreementCase | null {
  const english = locale === 'en';
  if ((!english && locale !== 'zh') || !(english ? PUBLIC_ENGLISH_CASE_SLUGS : PUBLIC_CASE_SLUGS).has(slug)) return null;
  const record = english ? getEnglishCase(slug) : getCaseArticle(slug);
  if (!record || !/^[a-z0-9-]+$/.test(record.id)) return null;
  const file = path.join(process.cwd(), 'content', english ? 'cases-en' : 'cases', record.id + '.json');
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (data.slug !== slug || !data.presentation) return null;
  const localized = english ? undefined : chineseCaseIntro(slug)?.presentation;
  return { ...data.presentation, ...localized, slug, locale, title: record.title, summary: record.summary,
    heroImage: record.cover?.src, heroAlt: record.cover?.alt ?? '', seoTitle: data.seoTitle, seoDescription: data.seoDescription,
    datePublished: data.datePublished, dateModified: data.dateModified };
}
