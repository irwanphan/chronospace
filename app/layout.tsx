import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from '@/components/providers/SessionProvider';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: "Chronospace",
  description: "Administrative Workspace",
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
  content,
}: {
  children: React.ReactNode;
  content?: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <body className={`font-montserrat`}>
        <AuthProvider>
          {children}
          {content}
        </AuthProvider>
      </body>
    </html>
  );
}
