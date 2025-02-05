import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import './css/index.css';
import './css/game-img.css';
import 'tailwindcss/tailwind.css';

export const metadata: Metadata = {
  title: 'Monster Hunter',
  description: 'Monster Hunter',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`} suppressHydrationWarning>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
