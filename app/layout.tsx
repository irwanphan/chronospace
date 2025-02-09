import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: "Chronospace",
  description: "Administrative Workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
