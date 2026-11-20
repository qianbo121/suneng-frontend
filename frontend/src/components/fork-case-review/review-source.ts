import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCaseArticle } from '@/lib/cases/server';
import { chineseCaseIntro } from '@/lib/cases/chinese-intros';
import type { FilmTrack, TrackedProject } from '@/components/agreement-cases/TrackedFilm';

export type ReviewCard = {
  title: string; paragraphs: string[]; definitions: string[][];
  table?: { head: string[]; rows: string[][]; rowHeaders: boolean };
};
type Review = {
  image: string; imageAlt: string; category: string; metrics: string[][]; note: string; work: string[][];
  featuresTitle: string; features: string[][]; flowTitle: string; filmId: string; stages: TrackedProject['stages'];
  cards: ReviewCard[]; figure: { src: string; alt: string; caption: string };
  related: string[][]; faq: string[][]; faqIntro: string; source: string; ctaTitle: string;
};

export const isForkReview = (locale: string, slug: string) =>
  locale === 'zh' && slug.startsWith('fork-') && getCaseArticle(slug)?.publicationStatus === 'published';

export function getReviewSource(slug: string) {
  if (!isForkReview('zh', slug)) throw new Error('Unknown review case');
  const intro = chineseCaseIntro(slug);
  if (!intro) throw new Error('Missing case introduction: ' + slug);
  const review: Review = JSON.parse(readFileSync(join(process.cwd(), 'content/fork-review', slug + '.json'), 'utf8'));
  const directory = '/fork-case-review/films/' + review.filmId;
  const track: FilmTrack = JSON.parse(readFileSync(join(process.cwd(), 'public', directory, 'camera.json'), 'utf8'));
  return { ...review, ...intro, slug, tracked: { directory, track, stages: review.stages } };
}
