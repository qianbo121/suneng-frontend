import { notFound } from 'next/navigation';
import { hasPublishedGuides } from '@/lib/publication-scope';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasPublishedGuides(locale, 'articles')) notFound();
  // Each leaf page still enforces its own approval, even without middleware.
  return children;
}
