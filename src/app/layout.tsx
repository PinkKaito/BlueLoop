import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlueLoop — Smart Township Water Intelligence | Sime Darby Property',
  description:
    'Autonomous predictive stormwater retention and non-potable irrigation reuse system for master-planned townships (City of Elmina & Bandar Bukit Raja). Track: PLANET.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] antialiased select-none font-sans">
        {children}
      </body>
    </html>
  );
}
