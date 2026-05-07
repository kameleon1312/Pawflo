import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Fraunces } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  axes: ['opsz'],
  display: 'swap',
});

// Cabinet Grotesk ships as local font (fontshare.com)
const cabinetGrotesk = localFont({
  src: [
    { path: '../public/fonts/CabinetGrotesk-Regular.woff2', weight: '400' },
    { path: '../public/fonts/CabinetGrotesk-Medium.woff2', weight: '500' },
    { path: '../public/fonts/CabinetGrotesk-Bold.woff2', weight: '700' },
    { path: '../public/fonts/CabinetGrotesk-Extrabold.woff2', weight: '800' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pawflo.pl'),
  title: {
    default: 'PawFlo — Znajdź soulmate\'a dla swojego psa',
    template: '%s | PawFlo',
  },
  description:
    'PawFlo łączy psy z okolicy. Dopasowania MachDog, panel zdrowia PawPanel i mapa usług PawMap — wszystko w jednej aplikacji mobilnej.',
  keywords: ['aplikacja dla psów', 'psy Polska', 'spotkania psów', 'panel zdrowia psa', 'weterynarz mapa'],
  authors: [{ name: 'PawFlo' }],
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://pawflo.pl',
    siteName: 'PawFlo',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'PawFlo' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#F08A8A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${fraunces.variable} ${cabinetGrotesk.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Przejdź do treści
        </a>
        {children}
      </body>
    </html>
  );
}
