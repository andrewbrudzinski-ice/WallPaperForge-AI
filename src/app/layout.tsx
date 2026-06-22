import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "WallpaperForge AI — Device-perfect AI wallpapers",
  description:
    "Generate AI phone wallpapers optimized for your exact device — focal subjects stay clear of clocks, widgets, notches, and app icons.",
  manifest: "/manifest.webmanifest",
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
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col md:max-w-2xl lg:max-w-5xl">
          {children}
        </div>
      </body>
    </html>
  );
}
