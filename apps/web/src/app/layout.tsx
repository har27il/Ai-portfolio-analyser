import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio Intelligence',
  description: 'AI-powered portfolio analysis for retail investors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
