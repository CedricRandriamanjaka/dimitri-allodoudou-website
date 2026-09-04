import WaitlistForm from "@/components/WaitlistForm";
import Reveal from "@/components/Reveal";
import VoiceExperience from "@/components/VoiceExperience";
import IntroCurtain from "@/components/IntroCurtain";

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Allo Doudou",
    inLanguage: "fr-FR",
    description:
      "Expérience vocale privée, 100% audio, bientôt disponible à La Réunion.",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "La Réunion",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <IntroCurtain />

      <div className="page-shell">
        <Reveal as="header" className="brand" aria-label="Allo Doudou">
          <a className="brand-mark" href="#top" aria-label="Allo Doudou">
            <img
              className="brand-logo"
              src="/logo.png"
              alt=""
              width={44}
              height={44}
            />
            <span className="brand-text">
              <span className="brand-allo">Allo</span>
              <span className="brand-doudou">Doudou</span>
            </span>
          </a>

          <span className="brand-note">
            <i />
            bientôt à La Réunion
          </span>
        </Reveal>

        <main id="top">
          <section className="hero" aria-labelledby="hero-title">
            <Reveal className="hero-copy" delay={60}>
              <p className="eyebrow">La Réunion · 100% audio · 100% discret</p>

              <h1 id="hero-title">
                Une voix.
                <br />
                <span>Un moment à vous.</span>
              </h1>

              <p className="hero-text">
                Allo Doudou arrive bientôt à La Réunion. Une expérience vocale
                privée, simple et sans caméra, pensée pour laisser la place à
                l’échange, en toute discrétion.
              </p>

              <WaitlistForm />

              <div className="trust-row" aria-label="Nos engagements">
                <span><i /> Audio uniquement</span>
                <span><i /> Aucun numéro échangé</span>
                <span><i /> Discrétion avant tout</span>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <VoiceExperience />
            </Reveal>
          </section>

          <Reveal as="section" className="bottom-note" aria-label="Allo Doudou" delay={120}>
            <span>Écouter.</span>
            <i />
            <span>Choisir son moment.</span>
            <i />
            <span>Parler.</span>
          </Reveal>
        </main>

        <Reveal as="footer" delay={80}>
          <div className="footer-brand">
            <img
              className="footer-logo"
              src="/logo.png"
              alt=""
              width={28}
              height={28}
            />
            <p>© {new Date().getFullYear()} Allo Doudou</p>
          </div>
          <p>La Réunion · Le lancement approche.</p>
        </Reveal>
      </div>
    </>
  );
}
