import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FinTrack - Personal Finance Management",
  description:
    "Track your expenses, manage budgets, and get AI-powered financial insights",
  keywords: ["finance", "budgeting", "expense tracking", "personal finance"],
  authors: [{ name: "FinTrack Team" }],
  creator: "FinTrack",
  openGraph: {
    title: "FinTrack - Personal Finance Management",
    description:
      "Track your expenses, manage budgets, and get AI-powered financial insights",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinTrack - Personal Finance Management",
    description:
      "Track your expenses, manage budgets, and get AI-powered financial insights",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
