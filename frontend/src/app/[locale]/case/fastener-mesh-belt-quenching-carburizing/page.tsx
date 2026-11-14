import { notFound } from 'next/navigation';
import { FastenerCase } from '@/components/case-studies/fastener-mesh-belt/FastenerCase';
import { fastenerCasePublished, fastenerCaseVisible } from '@/lib/cases/fastener-case-entry';
import { caseSearchMetadata } from '@/lib/cases/search-metadata';
import { fastenerCaseSearchContent } from '@/lib/cases/fastener-case-search';

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  if ((await params).locale !== 'zh' || !fastenerCaseVisible()) notFound();
  return caseSearchMetadata(fastenerCaseSearchContent, fastenerCasePublished());
}
export default async function Page({ params }: Props) {
  if ((await params).locale !== 'zh' || !fastenerCaseVisible()) notFound();
  return <FastenerCase />;
}
