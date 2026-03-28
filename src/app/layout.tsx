import type { Metadata } from "next";
import "./globals.css";
import { ThemeInitializer } from "@/components/layout/ThemeInitializer";

export const metadata: Metadata = {
  metadataBase: new URL("https://vitalarc.vercel.app"),
  title: "VitalArc — Your Health's Check Engine Light",
  description: "AI-powered preventive health platform that predicts health risks, calculates biological age, and recommends actionable lifestyle changes using medical-grade scoring engines.",
  keywords: "health, preventive, biological age, risk prediction, AI, wellness, longevity",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "VitalArc — Clinical Longevity Platform",
    description: "Map your biological age, predict 10-year health risks, and get AI-powered coaching — in 2 minutes.",
    images: ["/logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VitalArc",
    description: "Your health's clinical check engine light.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#00d4aa" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VitalArc" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}

