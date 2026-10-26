import type { Metadata } from "next";

import "./globals.css";

import { Toaster } from "@/components/ui/toast";
import { siteUrl } from "@/lib/site";

// The root layout is a SERVER component: metadata + the global toaster.
// VeloxPOS is a dark-only application (the reference's measured aesthetic) —
// there is no theme boot script or light variant.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "VeloxPOS (Point Of Sale)",
  description:
    "VeloxPOS — a fast, self-hosted point of sale: terminal, inventory, registers, cashiers, and reports.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="vx-canvas min-h-dvh antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
