import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { CommandMenuProvider } from "@/components/command-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { cn } from "@/lib/utils";

const outfitHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// OG and Twitter images come from app/opengraph-image.tsx (and the per-post
// variant under blog/[slug]), so no static image URLs are declared here.
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  applicationName: "YouTube to Blog",
  authors: [{ name: "OrcDev", url: "https://github.com/TheOrcDev" }],
  category: "technology",
  creator: "OrcDev",
  description:
    "Search engines can't read videos — they read text. Paste a YouTube link or upload a video and AI turns it into an SEO-ready blog post: it watches the audio and visuals, writes a structured article, and gives you Markdown or API access.",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { sizes: "any", url: "/favicon.ico" },
      { sizes: "192x192", type: "image/png", url: "/icon-192.png" },
      { sizes: "512x512", type: "image/png", url: "/icon-512.png" },
    ],
    shortcut: "/favicon.ico",
  },
  keywords: [
    "YouTube to blog",
    "convert YouTube video to blog post",
    "video to blog converter",
    "video to article AI",
    "turn video into blog post",
    "make videos searchable on Google",
    "video SEO content",
    "repurpose video content",
    "AI blog generator from video",
    "YouTube video to article",
    "video content repurposing tool",
    "blog post from video upload",
    "video to Markdown",
    "AI video understanding",
    "content repurposing",
    "blog generation API",
  ],
  manifest: "/manifest.json",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    description:
      "Search engines can't read videos — they read text. AI watches your video and writes an SEO-ready blog post you can publish, export as Markdown, or fetch over the API.",
    locale: "en_US",
    siteName: "YouTube to Blog",
    title: "YouTube to Blog — Turn Videos into SEO-Ready Blog Posts",
    type: "website",
    url: "/",
  },
  publisher: "OrcDev",
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
  },
  title: {
    default: "YouTube to Blog — Turn Videos into SEO-Ready Blog Posts",
    template: "%s | YouTube to Blog",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@orcdev",
    description:
      "Search engines can't read videos — they read text. AI watches your video and writes an SEO-ready blog post in minutes.",
    title: "YouTube to Blog — Turn Videos into SEO-Ready Blog Posts",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn("font-sans", dmSans.variable, outfitHeading.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <body className="antialiased">
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
