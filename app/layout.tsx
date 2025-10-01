import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

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
        url: "/youtube-to-blog-logo.png",
        width: 1200,
        height: 630,
        alt: "YouTube to Blog - Convert Videos to Professional Blog Posts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to Blog - Convert Videos to Professional Blog Posts",
    description:
      "Transform YouTube videos into well-structured, professional blog posts using AI. Perfect for content creators, developers, and anyone who wants to convert video content into written format with one click.",
    images: ["/youtube-to-blog-logo.png"],
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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/youtube-to-blog-logo.png",
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
          <Header />
          <main className="mt-30">{children}</main>
          <Footer />

          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
