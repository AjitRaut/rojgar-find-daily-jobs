import "./globals.css";
import type { Metadata } from "next";

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Rojgar Find – Daily Jobs",
  description: "AI-assisted workforce hiring and management for rural and semi-urban India"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
