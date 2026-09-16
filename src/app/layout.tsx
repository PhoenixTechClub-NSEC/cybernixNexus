import type { Metadata } from 'next';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { UserProvider } from '@/components/providers/UserProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: 'Cybernix Nexus',
  description:
    'Multi-platform competitive programming rating synchronization, rankings, level unlocking mascot tiers, and editorial hub for NSEC.',
  icons: {
    icon: '/crop_one.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FFF1D6] text-onyx antialiased selection:bg-tomato-jam selection:text-white" suppressHydrationWarning>
        <NextTopLoader
          color="#E5484D"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #E5484D,0 0 5px #E5484D"
        />
        <AuthProvider>
          <UserProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
