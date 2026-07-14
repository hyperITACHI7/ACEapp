import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Inter, Limelight, Roboto } from "next/font/google";
import { Toaster } from "@portfolio/ui-kit";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
});

// "ACE" in the sidebar wordmark — a decorative display font, distinct on purpose from the app's
// own Plus Jakarta/Inter type system.
const limelight = Limelight({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-limelight",
});

// The "." in the "ACE.app" wordmark — deliberately a third, plain font distinct from both
// Limelight (ACE) and Doto (app).
const roboto = Roboto({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-roboto",
});

export const metadata = {
  title: "ACEapp",
  description: "Build and publish a professional portfolio in minutes.",
};

// Every theme's palette references specific Google Fonts by literal family name (e.g.
// "'Bricolage Grotesque', sans-serif") rather than a next/font CSS variable, so those families
// must be loaded as real stylesheets here — otherwise every theme silently falls back to
// system fonts no matter what its palette declares.
const THEME_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Bricolage+Grotesque:opsz,wght@12..96,200..800",
    "family=Manrope:wght@300;400;500;600",
    "family=DM+Mono:wght@400;500",
    "family=JetBrains+Mono:wght@400;500;600;700",
    "family=Libre+Baskerville:wght@400;700",
    "family=Nunito:wght@400;600;700;800",
    "family=DM+Sans:wght@400;500;700",
    "family=Merriweather:wght@400;700",
    "family=Poppins:wght@400;500;600;700",
    "family=Playfair+Display:wght@400;700;800",
    "family=Source+Sans+3:wght@400;500;600;700",
  ].join("&") +
  "&display=swap";

// "app" in the sidebar wordmark — not in next/font/google's bundled font list for this Next.js
// version, so loaded as a real stylesheet like the per-theme fonts above rather than via
// next/font.
const DOTO_HREF = "https://fonts.googleapis.com/css2?family=Doto:wght@400..900&display=swap";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} ${limelight.variable} ${roboto.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={THEME_FONTS_HREF} rel="stylesheet" />
        <link href={DOTO_HREF} rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
