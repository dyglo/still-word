import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { VisitorAnalytics } from '@/components/Analytics';
import { Analytics } from '@vercel/analytics/next';

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "StillWord",
  description: "A slow-reading blog.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        {children}
        <VisitorAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
