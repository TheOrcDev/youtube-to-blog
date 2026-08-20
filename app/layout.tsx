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

export const metadata: Metadata = {
  title: {
    default: "YouTube to Blog - Turn Videos & Uploads into Blog Posts",
    template: "%s | YouTube to Blog",
  },
  description:
    "Turn any video into a ready-to-publish blog post. Paste a YouTube link or upload your own video — AI watches the audio and visuals and writes a structured article you can export as Markdown.",
  keywords: [
    "YouTube to blog",
    "video to blog",
    "video to article",
    "AI blog generator",
    "video upload to blog post",
    "AI video understanding",
    "content repurposing",
    "blog writing",
    "Markdown export",
    "AI writing tool",
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
    title: "YouTube to Blog - Turn Videos & Uploads into Blog Posts",
    description:
      "Turn any video into a ready-to-publish blog post. Paste a YouTube link or upload your own video — AI watches it and writes a structured article you can export as Markdown.",
    siteName: "YouTube to Blog",
    images: [
      {
        alt: "YouTube to Blog - Turn Videos & Uploads into Blog Posts",
        height: 630,
        url: "/og.png",
        width: 1200,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube to Blog - Turn Videos & Uploads into Blog Posts",
    description:
      "Turn any video into a ready-to-publish blog post. Paste a YouTube link or upload your own video — AI watches it and writes a structured article you can export as Markdown.",
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
