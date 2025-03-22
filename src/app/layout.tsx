import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Inter, Tajawal } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'موقع سائقي المعدات وأصحاب المعدات',
  description: 'منصة لربط سائقي المعدات بأصحاب المعدات',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} ${inter.variable} font-tajawal min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
