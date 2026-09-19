import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";
import { SITE } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageviewTracker } from "@/components/layout/PageviewTracker";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "¿Me da? Calcula si te da para comprarlo | MeDa",
    template: "%s | MeDa",
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: SITE.name,
    title: "¿Te da para eso? | MeDa",
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "¿Te da para eso? | MeDa", description: SITE.description },
  robots: { index: true, follow: true },
  ...(SITE.adsenseClient && { other: { "google-adsense-account": SITE.adsenseClient } }),
};

export const viewport: Viewport = {
  themeColor: "#f5f6f3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  inLanguage: "es-ES",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <head>
        {/* Etiqueta normal en el HTML inicial: el rastreador de AdSense no ejecuta JS. */}
        {SITE.adsenseClient ? (
          <script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`}
          />
        ) : null}
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Analítica sin cookies: visitas y eventos de lib/analytics.ts. */}
        <Analytics />
        <PageviewTracker />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
