import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/next';
import { JsonLd } from '@/components/seo/json-ld';
import './globals.css';

export const metadata: Metadata = {
  title: 'DiffLab - Compare JSON, YAML, TOML & Code',
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
  ],
  authors: [{ name: 'doguyilmaz', url: 'https://doguyilmaz.com' }],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'DiffLab - Compare JSON, YAML, TOML & Code',
    description:
      'Compare structured data and code files side by side with instant diff visualization.',
    type: 'website',
    locale: 'en_US',
    siteName: 'DiffLab',
  },
  twitter: {
    card: 'summary_large_image',
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
