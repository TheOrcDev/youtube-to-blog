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
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "OrcDev" }],
  category: "technology",
  creator: "OrcDev",
  description:
    "Turn any video into a ready-to-publish blog post. Paste a YouTube link or upload your own video — AI watches the audio and visuals and writes a structured article you can export as Markdown.",
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
  manifest: "/manifest.json",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    description:
      "Turn any video into a ready-to-publish blog post. Paste a YouTube link or upload your own video — AI watches it and writes a structured article you can export as Markdown.",
    images: [
      {
        alt: "YouTube to Blog - Turn Videos & Uploads into Blog Posts",
        height: 630,
        url: "/og.png",
        width: 1200,
      },
    ],
    locale: "en_US",
    siteName: "YouTube to Blog",
    title: "YouTube to Blog - Turn Videos & Uploads into Blog Posts",
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
    default: "YouTube to Blog - Turn Videos & Uploads into Blog Posts",
    template: "%s | YouTube to Blog",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@orcdev",
    description:
      "Turn any video into a ready-to-publish blog post. Paste a YouTube link or upload your own video — AI watches it and writes a structured article you can export as Markdown.",
    images: ["/og.png"],
    title: "YouTube to Blog - Turn Videos & Uploads into Blog Posts",
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
