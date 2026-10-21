import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aurum Buds Pro | Sound, in gold.",
  description: "Flagship wireless audio, re-engineered for a world that never stops.",
  openGraph: {
    title: "Aurum Buds Pro | Sound, in gold.",
    description: "Flagship wireless audio, re-engineered for a world that never stops.",
    type: "website",
    images: [
      {
        url: "/hero.webp",
        width: 1920,
        height: 1080,
        alt: "Aurum Buds Pro - Premium Wireless Earbuds",
      },
    ],
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
