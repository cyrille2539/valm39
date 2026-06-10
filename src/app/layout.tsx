import type { Metadata } from "next";
import { Lora, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ValM39 — Artisan rénovation intérieure dans le Jura (39)",
  description:
    "Artisan rénovation intérieure dans le Jura (39). Cuisine, parquet, cloisons, peinture — finition exemplaire, devis transparent, délais respectés. Devis gratuit sous 24h.",
  authors: [{ name: "ValM39" }],
  metadataBase: new URL("https://www.valm39.fr"),
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "ValM39",
    title: "ValM39 — Artisan rénovation intérieure dans le Jura (39)",
    description:
      "Cuisine, parquet, cloisons, peinture — finition exemplaire pour particuliers, Airbnb, investisseurs et agences. Devis gratuit sous 24h.",
    type: "website",
    url: "https://www.valm39.fr/",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "ValM39 — Artisan rénovation intérieure dans le Jura (39)",
    description:
      "Cuisine, parquet, cloisons, peinture — finition exemplaire pour particuliers, Airbnb, investisseurs et agences. Devis gratuit sous 24h.",
  },
};

const jsonLdBusiness = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": "https://www.valm39.fr/#business",
  name: "ValM39",
  description:
    "Artisan spécialiste de la rénovation intérieure haut de gamme dans le Jura (39) : pose de cuisine, pose de parquet, cloisons et peinture. Devis transparent, délais respectés, finition exemplaire.",
  url: "https://www.valm39.fr",
  telephone: "+33786008992",
  openingHours: ["Mo-Fr 08:00-18:00"],
  email: "contact@valm39.fr",
  priceRange: "€€",
  image: "https://www.valm39.fr/og-image.jpg",
  address: {
    "@type": "PostalAddress",
    addressRegion: "Jura",
    addressCountry: "FR",
    postalCode: "39",
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Jura (39)",
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Bourgogne-Franche-Comté",
    },
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services de rénovation intérieure",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Pose de cuisine",
          description:
            "Installation complète de cuisines sur mesure ou en kit, avec raccordements et finitions soignées.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Pose de parquet",
          description:
            "Parquet massif, contrecollé ou stratifié — posé avec précision pour un sol chaleureux et résistant.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Pose de cloisons",
          description:
            "Cloisons en placo, ossature bois ou métal avec isolation phonique et thermique intégrée.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Peinture intérieure",
          description:
            "Préparation minutieuse des surfaces et application soignée. Peinture mate, satinée ou laquée.",
        },
      },
    ],
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://wriwpdmsayhvjjhuotqv.supabase.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBusiness) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ValM39",
              url: "https://www.valm39.fr",
            }),
          }}
        />
      </head>
      <body className={`${lora.variable} ${dmSans.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
