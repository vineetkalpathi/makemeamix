import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./_components/Nav";
import Footer from "./_components/Footer";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3e8d1" },
    { media: "(prefers-color-scheme: dark)", color: "#1a130d" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://makemeamix.com"),
  title: "makemeamix",
  description: "A mix made by hand, shaped for the moment.",
  openGraph: {
    title: "makemeamix",
    description: "A mix made by hand, shaped for the moment.",
    url: "https://makemeamix.com",
    siteName: "makemeamix",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "makemeamix",
    description: "A mix made by hand, shaped for the moment.",
    images: ["/og-image.png"],
  },
};

// Inline so the theme is applied before paint and avoids a flash.
const themeBoot = `
(function(){try{
  var t = localStorage.getItem('mmx-theme');
  if (t !== 'light' && t !== 'dark') {
    t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', t);
}catch(e){
  document.documentElement.setAttribute('data-theme','light');
}})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-density="cozy"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${bricolage.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body data-bg="sunset" className="paper-grain">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
