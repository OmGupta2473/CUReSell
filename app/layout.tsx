import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/layout/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CUReSell - Campus Resell',
  description: 'Buy and sell used items within your college campus',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
