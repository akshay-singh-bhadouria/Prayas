import type { Metadata, Viewport } from 'next';
import { Manrope, Literata } from 'next/font/google';
import './globals.css';

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

const headlineFont = Literata({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'PRAYAS | Offline-First UPSC Companion',
  description:
    'PRAYAS is an offline-first, GenAI-powered UPSC preparation companion for strategy, tests, and wellbeing.',
  applicationName: 'PRAYAS',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: ['/icons/icon-192.png', '/icons/icon-512.png'],
    apple: '/icons/icon-192.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headlineFont.variable}`}>
      <body className="text-ink-900">
        {children}
      </body>
    </html>
  );
}
