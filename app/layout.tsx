import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import PWAProvider from '@/components/PWAProvider';
import './globals.css';

export const metadata: Metadata = {
  title:       'MSP — Melanie Services & Prest.',
  description: 'Gestion des partenaires, marchés et documents',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'default',
    title:          'MSP App',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png',  sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png',  sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon-152x152.png',     sizes: '152x152', type: 'image/png' },
    ],
    shortcut: '/icon-192x192.png',
  },
  openGraph: {
    title:       'MSP App — Melanie Services & Prest.',
    description: 'Espace de gestion des partenaires, marchés et documents',
    type:        'website',
    images:      [{ url: '/icon-512x512.png', width: 512, height: 512 }],
  },
  robots: { index: false, follow: false },
  other: {
    'msapplication-TileColor': '#3D3B8E',
    'msapplication-TileImage': '/icon-144x144.png',
    'mobile-web-app-capable':  'yes',
    'format-detection':        'telephone=no',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3D3B8E' },
    { media: '(prefers-color-scheme: dark)',  color: '#2e2c72' },
  ],
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit:  'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          {children}
          <PWAProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
