import type { Metadata } from 'next';
import { ReactNode } from 'react';

import '@/app/globals.css';
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, DEFAULT_OG_IMAGE, DEFAULT_TITLE, SITE_NAME, SITE_URL } from '@/lib/seo/config';
import { getVerificationMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s｜苏能工业炉',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    ...(DEFAULT_OG_IMAGE ? { images: [{ url: DEFAULT_OG_IMAGE }] } : {}),
  },
  twitter: {
    card: 'summary_large_image',
    ...(DEFAULT_OG_IMAGE ? { images: [DEFAULT_OG_IMAGE] } : {}),
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon.png', sizes: '256x256', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  ...getVerificationMetadata(),
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
