import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "WallpaperForge AI — Device-perfect AI wallpapers",
  description:
    "Generate AI phone wallpapers optimized for your exact device — focal subjects stay clear of clocks, widgets, notches, and app icons.",
  manifest: "/manifest.webmanifest",
  applicationName: "WallpaperForge AI",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WallpaperForge",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body>
        <AppProviders>
          <div className="mx-auto flex min-h-screen w-full max-w-md flex-col md:max-w-2xl lg:max-w-5xl">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
