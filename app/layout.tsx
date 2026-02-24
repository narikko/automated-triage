import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '../components/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'ShopSift | AI Support for E-commerce',
  description: 'Your customer inbox, sorted on autopilot. Let ShopSift handle your support tickets with AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Suppress hydration warning is needed for next-themes to inject the class safely
    <html lang="en" suppressHydrationWarning> 
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
