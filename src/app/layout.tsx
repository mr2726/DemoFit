
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Roboto_Condensed } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';

const roboto_condensed = Roboto_Condensed({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-roboto-condensed',
});

export const metadata: Metadata = {
  title: 'Fitness Hub',
  description: 'Your all-in-one platform for fitness plans, nutrition, and supplements.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', roboto_condensed.variable)}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
