import type { Metadata } from 'next';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

export const metadata: Metadata = {
  title: 'Cybernix Nexus — NSEC Phoenix Tech Club CP Dashboard',
  description:
    'Multi-platform competitive programming rating synchronization, inter-department battles, level unlocking mascot tiers, and editorial hub for NSEC.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FFF1D6] text-onyx antialiased selection:bg-tomato-jam selection:text-white">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
