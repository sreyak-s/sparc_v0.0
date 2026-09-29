import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Starfield from '@/components/layout/Starfield';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'SPARC Aerospace Club | University Space Research & Cosmonautics',
  description: 'Official portal of SPARC Aerospace Club. Sounding rockets, CanSat telemetry, high-altitude balloons, and flight attendance system.',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-space-950 text-slate-100 min-h-screen flex flex-col relative selection:bg-cyan-500 selection:text-black">
        <AuthProvider>
          {/* Interactive Particle Starfield */}
          <Starfield />

          {/* Glowing Top Navbar */}
          <Navbar />

          {/* Main Content Viewport */}
          <main className="flex-1 relative z-10">
            {children}
          </main>

          {/* Telemetry Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
