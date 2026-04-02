import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iPartner - Be an IPartner Today",
  description:
    "iPartner was formed to create a more structured way of creating, filtering and growing relationships. Join us to help monetize and build the brands of the future.",
  keywords: "ipartner, partnerships, domain partnerships, app partnerships, contrib",
  openGraph: {
    title: "iPartner - Be an IPartner Today",
    description:
      "Create structured partnerships and help build the brands of the future.",
    type: "website",
    url: "https://ipartner.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Analytics />
        <Header domain="ipartner.com" />
        <main className="flex-1">{children}</main>
        <Footer domain="ipartner.com" />
      </body>
    </html>
  );
}
