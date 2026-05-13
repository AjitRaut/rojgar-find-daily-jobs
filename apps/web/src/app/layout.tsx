import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Rojgar Find – Daily Jobs",
  description:
    "Modern workforce platform — hire verified electricians, plumbers, painters & labour with AI-assisted matching."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontSans.variable, "min-h-screen font-sans")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
