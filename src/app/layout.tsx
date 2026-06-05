import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
    images: [{ url: "/og-image.jpg" }],
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "ValM39 — Artisan rénovation intérieure dans le Jura (39)",
    description:
      "Cuisine, parquet, cloisons, peinture — finition exemplaire pour particuliers, Airbnb, investisseurs et agences. Devis gratuit sous 24h.",
    images: ["/og-image.jpg"],
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
  telephone: "+33600000000",
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
