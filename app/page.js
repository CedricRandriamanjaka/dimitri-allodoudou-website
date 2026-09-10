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
            <img src="/logo.png" alt="" width={40} height={40} />
            <span>PEEMENTE</span>
          </a>
          <span className="top-chip">Bientôt</span>
        </header>

        <main id="top">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <h1 id="hero-title" className="anim-in" style={{ "--d": "120ms" }}>
                Le site de rencontre qui met du{" "}
                <span className="accent">piment</span> dans tes{" "}
                <span className="accent soft">dates</span>
              </h1>
              <p className="hero-sub anim-in" style={{ "--d": "220ms" }}>
                <span>100% Péi</span>
                <i aria-hidden="true" />
                <span>couples & célibataires libres</span>
                <i aria-hidden="true" />
                <span>sans tabous</span>
              </p>
              <div className="anim-in" style={{ "--d": "320ms" }}>
                <WaitlistForm />
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <img className="shot shot-a" src="/photos/p1.jpg" alt="" />
              <img className="shot shot-b" src="/photos/p2.jpg" alt="" />
              <img className="shot shot-c" src="/photos/moment.jpg" alt="" />
            </div>
          </section>
        </main>

        <footer className="anim-in" style={{ "--d": "480ms" }}>
          <p>© {new Date().getFullYear()} PEEMENTE · La Réunion</p>
        </footer>
      </div>
    </>
  );
}
