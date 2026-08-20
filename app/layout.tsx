import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { CommandMenuProvider } from "@/components/command-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { isBillingEnabled } from "@/lib/billing/enabled";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "YouTube to Blog - Convert Videos to Professional Blog Posts",
    template: "%s | YouTube to Blog",
  },
  description:
    "Transform YouTube videos into well-structured, professional blog posts using AI. Perfect for content creators, developers, and anyone who wants to convert video content into written format with one click.",
  keywords: [
    "YouTube to blog",
    "video to blog",
    "AI blog generator",
    "content creation",
    "video transcription",
    "blog writing",
    "content conversion",
    "YouTube transcript",
    "AI writing tool",
    "video content",
  ],
  authors: [{ name: "OrcDev" }],
  creator: "OrcDev",
  publisher: "OrcDev",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "YouTube to Blog - Convert Videos to Professional Blog Posts",
    description:
      "Transform YouTube videos into well-structured, professional blog posts using AI. Perfect for content creators, developers, and anyone who wants to convert video content into written format with one click.",
    siteName: "YouTube to Blog",
    images: [
      {
        alt: "YouTube to Blog - Convert Videos to Professional Blog Posts",
        height: 630,
        url: "/og.png",
        width: 1200,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to Blog - Convert Videos to Professional Blog Posts",
    description:
      "Transform YouTube videos into well-structured, professional blog posts using AI. Perfect for content creators, developers, and anyone who wants to convert video content into written format with one click.",
    images: ["/og.png"],
    creator: "@orcdev",
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
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { type: "image/png", url: "/icon-192.png", sizes: "192x192" },
      { type: "image/png", url: "/icon-512.png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <CommandMenuProvider billingEnabled={isBillingEnabled()}>
            {children}
            <Toaster />
            <Analytics />
          </CommandMenuProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
