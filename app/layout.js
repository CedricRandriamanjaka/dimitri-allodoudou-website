import "./globals.css";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://peemente.netlify.app"
  ),
  title: "PEEMENTE — Rencontres libertines 100% Péi",
  description:
    "PEEMENTE, le 1er réseau social libertin à La Réunion. Couples et célibataires libres, intentions claires, discrétion max. Inscris-toi pour le lancement.",
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
    siteName: "PEEMENTE",
    title: "PEEMENTE — Rencontres libertines 100% Péi",
    description:
      "Couples et célibataires libres à La Réunion. Intentions claires, discrétion max. Bientôt.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "PEEMENTE — Rencontres libertines 100% Péi",
    description:
      "Couples et célibataires libres à La Réunion. Intentions claires, discrétion max. Bientôt.",
  },
  other: {
    "geo.region": "FR-RE",
    "geo.placename": "La Réunion",
    language: "fr-FR",
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
  },
};

export const viewport = {
  themeColor: "#FFEDDD",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;var s=sessionStorage.getItem("peemente-intro-seen");document.documentElement.classList.add(r||s?"intro-skip":"intro-pending");}catch(e){document.documentElement.classList.add("intro-pending");}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
