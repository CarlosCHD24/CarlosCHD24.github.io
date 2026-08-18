import type { Metadata } from "next";
import localFont from "next/font/local";
import { siteIndexingEnabled, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  display: "swap",
  weight: "100 900",
  style: "normal",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Oportunidades de empleo público en Sevilla",
  description:
    "Visor de convocatorias, bolsas y procesos de provisión de empleo público en Sevilla y su provincia.",
  metadataBase: siteUrl,
  robots: {
    index: siteIndexingEnabled,
    follow: siteIndexingEnabled,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl.origin}/#website`,
  url: siteUrl.toString(),
  name: "Oportunidades de empleo público en Sevilla",
  description:
    "Visor de convocatorias, bolsas y procesos de provisión de empleo público en Sevilla y su provincia.",
  inLanguage: "es",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <a className="skip-link" href="#main-content">
          Ir al contenido principal
        </a>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
