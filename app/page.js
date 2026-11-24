import WaitlistForm from "@/components/WaitlistForm";
import IntroCurtain from "@/components/IntroCurtain";

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PEEMENTE",
    inLanguage: "fr-FR",
    description:
      "Premier réseau social libertin pour couples et célibataires libres à La Réunion.",
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

      <div className="bg-stage" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <span className="bg-sweep" />
      </div>

      <div className="shell">
        <header className="topbar anim-in" style={{ "--d": "0ms" }}>
          <a className="logo" href="#top" aria-label="PEEMENTE">
            <img src="/logo.png" alt="" width={48} height={48} />
            <span>Peemente</span>
          </a>
        </header>

        <main id="top">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <span className="top-chip anim-in" style={{ "--d": "60ms" }}>
                Bientôt à La Réunion, le nouveau réseau social libertin
              </span>
              <h1 id="hero-title" className="anim-in" style={{ "--d": "120ms" }}>
                Rencontre des libertins péi dès ce soir et vis tes envies,{" "}
                <span className="accent">sans tabou.</span>
              </h1>
              <p className="hero-sub anim-in" style={{ "--d": "220ms" }}>
                Discret · Vérifié · Respectueux · 100 % Péi{" "}
                <img
                  className="flag"
                  src="https://flagcdn.com/w40/re.png"
                  alt="La Réunion"
                  width={20}
                  height={14}
                />
              </p>
              <div className="anim-in" style={{ "--d": "320ms" }}>
                <WaitlistForm />
              </div>
            </div>

            <div className="hero-visual anim-in" style={{ "--d": "250ms" }}>
              <div className="slider">
                <div className="track">
                  <div className="slide">
                    <img
                      src="/phone.jpg"
                      alt="Aperçu flouté de l’application Peemente, bientôt à La Réunion"
                    />
                  </div>
                  <div className="slide collage" aria-hidden="true">
                    <img className="shot shot-a" src="/photos/p1.jpg" alt="" />
                    <img className="shot shot-b" src="/photos/p2.jpg" alt="" />
                    <img className="shot shot-c" src="/photos/moment.jpg" alt="" />
                  </div>
                  <div className="slide" aria-hidden="true">
                    <img src="/phone.jpg" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="anim-in" style={{ "--d": "480ms" }}>
          <p>© {new Date().getFullYear()} Peemente · La Réunion</p>
        </footer>
      </div>
    </>
  );
}
