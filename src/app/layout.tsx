import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { JsonLd } from '@/components/seo/json-ld';
import './globals.css';

const SITE_URL = 'https://difflab.dev';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'DiffLab - Compare JSON, YAML, TOML & Code',
    template: '%s | DiffLab',
  },
  description:
    'Compare JSON, YAML, TOML, and code files side by side. Find missing keys, value differences, and structural changes instantly.',
  keywords: [
    'json diff',
    'yaml diff',
    'toml diff',
    'code comparison',
    'diff tool',
    'json compare',
    'text diff',
    'online diff',
    'code diff',
  ],
  authors: [{ name: 'doguyilmaz', url: 'https://doguyilmaz.com' }],
  creator: 'doguyilmaz',
  icons: {
    icon: '/icon.svg',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DiffLab - Compare JSON, YAML, TOML & Code',
    description:
      'Compare structured data and code files side by side with instant diff visualization.',
    url: SITE_URL,
    type: 'website',
    locale: 'en_US',
    siteName: 'DiffLab',
  },
  twitter: {
    card: 'summary',
    title: 'DiffLab - Compare JSON, YAML, TOML & Code',
    description:
      'Compare structured data and code files side by side with instant diff visualization.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta name='apple-mobile-web-app-title' content='DiffLab' />
        <JsonLd />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
