import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.votredomaine.re"),
  title: "Allo Doudou La Réunion — Expérience vocale privée bientôt disponible",
  description:
    "Allo Doudou arrive bientôt à La Réunion. Une expérience vocale privée, 100% audio, sans caméra et pensée pour rester discrète. Inscrivez-vous pour être prévenu du lancement.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Allo Doudou",
    title: "Allo Doudou La Réunion — Bientôt",
    description:
      "Une expérience vocale privée, 100% audio et sans caméra, bientôt disponible à La Réunion.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Allo Doudou La Réunion — Bientôt",
    description:
      "Une expérience vocale privée, 100% audio et sans caméra, bientôt disponible à La Réunion.",
  },
  other: {
    "geo.region": "FR-RE",
    "geo.placename": "La Réunion",
    language: "fr-FR",
  },
};

export const viewport = {
  themeColor: "#3D1F5C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
