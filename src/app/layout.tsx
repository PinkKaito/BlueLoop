import type { Metadata } from 'next';
import './globals.css';
import { BlueLoopProvider } from '@/components/workspace/BlueLoopProvider';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BlueLoopProvider>
          <WorkspaceShell>{children}</WorkspaceShell>
        </BlueLoopProvider>
      </body>
    </html>
  );
}
