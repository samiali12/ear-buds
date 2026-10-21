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

const TITLE = "Aurum Buds Pro | Sound, in gold.";
const DESCRIPTION =
  "Flagship wireless audio, re-engineered for a world that never stops.";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurumbudspro.example.com"),
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: [{ url: "/hero.webp", type: "image/webp" }],
    apple: [{ url: "/hero.webp", type: "image/webp" }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
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
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/hero.webp"],
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
