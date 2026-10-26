import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "OLT Cars | تأجير السيارات في الجزائر",
  description: "أفضل خدمات تأجير السيارات عبر موقع OLT Cars - استأجر سيارتك الآن بكل سهولة.",
  icons: {
    icon: "/olt-logo.png",
    apple: "/olt-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
