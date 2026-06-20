import { permanentRedirect } from 'next/navigation';

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  permanentRedirect(`/${locale}/products`);
}
