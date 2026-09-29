import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isPublishedGuide } from '@/lib/publication-scope';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';

export default async function RelatedCaseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isPublishedGuide(locale, '/zh/solutions/continuous-heat-treatment-line')) notFound();
  return (
    <>
      {children}
      <EntryCaseEvidence
        entryPath="/solutions/continuous-heat-treatment-line"
        locale={locale === 'en' ? 'en' : 'zh'}
      />
    </>
  );
}
