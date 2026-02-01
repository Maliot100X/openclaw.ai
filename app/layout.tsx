import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const miniappEmbed = JSON.stringify({
  version: "1",
  imageUrl: "https://openclaw-ai-one.vercel.app/og.png",
  button: {
    title: "Launch ClawAI",
    action: {
      type: "launch_miniapp",
      url: "https://openclaw-ai-one.vercel.app",
      name: "ClawAI King Booster",
    }
  }
});

const frameEmbed = JSON.stringify({
  version: "1",
  imageUrl: "https://openclaw-ai-one.vercel.app/og.png",
  button: {
    title: "Launch ClawAI",
    action: {
      type: "launch_frame",
      url: "https://openclaw-ai-one.vercel.app",
      name: "ClawAI King Booster",
    }
  }
});

export const metadata: Metadata = {
  title: "ClawAI King Booster",
  description: "Boost your coins to the top! A Farcaster Mini App for token discovery and promotion on Base and Zora.",
  openGraph: {
    title: "ClawAI King Booster",
    description: "Boost your coins to the top! A Farcaster Mini App for token discovery and promotion on Base and Zora.",
    images: ["https://openclaw-ai-one.vercel.app/og.png"],
    url: "https://openclaw-ai-one.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawAI King Booster",
    description: "Boost your coins to the top! A Farcaster Mini App for token discovery and promotion on Base and Zora.",
    images: ["https://openclaw-ai-one.vercel.app/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:miniapp" content={miniappEmbed} />
        <meta name="fc:frame" content={frameEmbed} />
        <meta property="og:image" content="https://openclaw-ai-one.vercel.app/og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ClawAI King Booster - Boost your coins to the top!" />
        <meta name="theme-color" content="#0D0D1A" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} antialiased bg-claw-darker text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
