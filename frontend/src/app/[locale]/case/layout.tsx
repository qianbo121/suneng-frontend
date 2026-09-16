import { notFound } from 'next/navigation';
import { TECHNICAL_CONTENT_PUBLISHED } from '@/lib/publication-scope';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!TECHNICAL_CONTENT_PUBLISHED) notFound();
  return children;
}
