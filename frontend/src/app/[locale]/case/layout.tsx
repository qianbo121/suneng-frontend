import { notFound } from 'next/navigation';
import { PUBLIC_CASE_SLUGS } from '@/lib/cases/public-case-allowlist';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (PUBLIC_CASE_SLUGS.size === 0) notFound();
  return children;
}
