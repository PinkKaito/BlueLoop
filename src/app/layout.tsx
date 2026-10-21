import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BlueLoop | Sime Darby Property Hackathon Demo',
  description:
    'Mock township stormwater and park irrigation demonstration inspired by Elmina Central Park, City of Elmina, Selangor, Malaysia. Planet theme: water conservation and climate resilience.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
