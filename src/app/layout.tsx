import type { Metadata, Viewport } from "next";

import "./globals.css";

import { Toaster } from "@/components/ui/toast";
import { siteUrl } from "@/lib/site";

// The root layout is a SERVER component: metadata + the global toaster.
// VeloxPOS is permanently dark in-app (the reference ships no theme toggle);
// the login route scopes .theme-light on its own wrapper (tokens.css).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "VeloxPOS (Point Of Sale)",
  description: "VeloxPOS — terminal, inventory, registers, cashiers, and sales analytics.",
};

export const viewport: Viewport = {
  themeColor: "#080a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-ink text-canvas-ink antialiased [font-family:ui-sans-serif,system-ui,sans-serif]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
