import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, Inter, Libre_Baskerville, Outfit, Silkscreen, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter-face" });
const pixel = Silkscreen({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-pixel-face" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk-face" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces-face" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit-face" });
const baskerville = Libre_Baskerville({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-baskerville-face" });
const plex = IBM_Plex_Sans({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-plex-face" });

export const metadata: Metadata = {
  title: {
    default: "prototype",
    template: "%s",
  },
  description:
    "Three working usability prototypes for Angela Lau’s NYU IMA design-research session. Sample content stays in the browser.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${pixel.variable} ${grotesk.variable} ${fraunces.variable} ${outfit.variable} ${baskerville.variable} ${plex.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
