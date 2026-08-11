import type { Metadata, Viewport } from "next";
import { Comfortaa, Geist_Mono, Poppins } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import InboundCatchBanner from "@/components/InboundCatchBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f9f7f5",
};

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
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

function vnocTrackerAttrs() {
  const enabled =
    (process.env.NEXT_PUBLIC_VNOC_ANALYTICS_ENABLED || "true").toLowerCase() !==
    "false";
  if (!enabled) return null;
  const endpoint = (
    process.env.NEXT_PUBLIC_VNOC_ANALYTICS_URL || "https://analytics.vnoc.com"
  ).replace(/\/$/, "");
  const domain = (process.env.NEXT_PUBLIC_DOMAIN || "ipartner.com")
    .trim()
    .toLowerCase()
    .replace(/^www\./, "");
  if (!domain) return null;
  return { endpoint, domain };
}

function isAppShell(pathname: string) {
  return (
    pathname === "/portal" ||
    pathname.startsWith("/portal/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const vnoc = vnocTrackerAttrs();
  const pathname = (await headers()).get("x-pathname") || "";
  const appShell = isAppShell(pathname);

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {vnoc && <link rel="preconnect" href={vnoc.endpoint} />}
      </head>
      <body className={`${comfortaa.className} min-h-full flex flex-col`}>
        <style>{`
          h1, h2, h3, h4, .ipp-loud {
            font-family: var(--font-display), ui-sans-serif, system-ui, sans-serif !important;
            font-weight: 700;
            letter-spacing: -0.03em;
            line-height: 1.08;
          }
        `}</style>
        {vnoc && (
          <Script
            src={`${vnoc.endpoint}/tracker.js`}
            strategy="beforeInteractive"
            data-endpoint={vnoc.endpoint}
            data-domain={vnoc.domain}
          />
        )}
        <Analytics />
        {!appShell && (
          <>
            <Header domain="ipartner.com" />
            <InboundCatchBanner />
          </>
        )}
        <main className="flex-1">{children}</main>
        {!appShell && (
          <Footer domain={process.env.NEXT_PUBLIC_DOMAIN || "ipartner.com"} />
        )}
      </body>
    </html>
  );
}
