import { permanentRedirect } from 'next/navigation';

type StrengthPageProps = { params: Promise<{ locale: string }> };

export default async function StrengthPage({ params }: StrengthPageProps) {
  const { locale } = await params;
  permanentRedirect(`/${locale === 'en' ? 'en' : 'zh'}/strength/honors`);
}
