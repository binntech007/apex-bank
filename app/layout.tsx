// app/layout.tsx
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { TawkToChat } from '@/components/landing/TawkToChat'; // Import it here
import './globals.css';

// ... metadata definitions ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-brand-canvas text-brand-navy">
        <SessionProvider>
          {children}
          <TawkToChat /> {/* Render it inside the session/body provider */}
        </SessionProvider>
      </body>
    </html>
  );
}