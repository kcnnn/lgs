import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RooferClaw Scope — Roof measurements from your drone in 30 minutes",
  description:
    "Upload your drone flight photos and get a full measurement report with squares, pitch, and line items — same day, not three days.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-black">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
