import type { Metadata } from 'next';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { UserProvider } from '@/components/providers/UserProvider';

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
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="min-h-screen bg-[#FFF1D6] text-onyx antialiased selection:bg-tomato-jam selection:text-white" suppressHydrationWarning>
        <UserProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </UserProvider>
      </body>
    </html>
  );
}
