import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';

export const metadata: Metadata = {
  title: 'BWCON — Corporate-Startup Matchmaking Platform',
  description: 'AI-powered matchmaking platform connecting corporate challenges with innovative startups',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="mesh-gradient min-h-screen">
          <Navigation />
          <main className="pt-32 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
