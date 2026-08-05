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
      <body className="min-h-screen bg-[#FFF1D6] text-onyx antialiased selection:bg-tomato-jam selection:text-white">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
