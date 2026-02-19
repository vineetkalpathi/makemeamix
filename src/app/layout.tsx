import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "makemeamix",
  description: "Vineet gotchu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#0b0b0f]/80 backdrop-blur-sm">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors w-fit">
            <Image src="/logo.png" alt="logo" width={32} height={32} className="rounded-sm" />
            makemeamix
          </Link>
        </nav>
        <div className="pt-[57px]">{children}</div>
      </body>
    </html>
  );
}
