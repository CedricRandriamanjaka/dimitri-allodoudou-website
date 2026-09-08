import WaitlistForm from "@/components/WaitlistForm";
import Reveal from "@/components/Reveal";
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

      <header className="brand" aria-label="PEEMENTE">
        <div className="page-shell brand-inner">
          <a className="brand-mark" href="#top" aria-label="PEEMENTE">
            <img className="brand-logo" src="/logo.png" alt="" width={48} height={48} />
            <span className="brand-name">PEEMENTE</span>
          </a>
          <a className="brand-cta" href="#waitlist">
            Rejoindre
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-media" aria-hidden="true">
            <img src="/photos/hero.jpg" alt="" className="hero-photo" />
            <div className="hero-shade" />
          </div>

          <div className="page-shell hero-content">
            <Reveal delay={40}>
              <p className="eyebrow">100% Péi · sans filtre · sans jugement</p>
              <h1 id="hero-title">PEEMENTE</h1>
              <p className="hero-lead">
                Le 1er réseau social libertin
                <br />
                made in La Réunion.
              </p>
              <p className="hero-text">
                Couples. Célibataires libres. Envies assumées.
                Ici, on match pour du vrai — discret, pimenté, 100% local.
              </p>
              <div id="waitlist" className="hero-form">
                <WaitlistForm />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="spice-strip" aria-label="L’ambiance PEEMENTE">
          <div className="page-shell spice-grid">
            <Reveal className="spice-card spice-wide" delay={60}>
              <img src="/photos/moment.jpg" alt="" />
              <div>
                <strong>Des rencontres plus épicées</strong>
                <p>Moins de blabla. Plus de feeling. Des profils qui savent ce qu’ils veulent.</p>
              </div>
            </Reveal>
            <Reveal className="spice-card" delay={120}>
              <img src="/photos/p1.jpg" alt="" />
              <div>
                <strong>Solo ou à deux</strong>
                <p>Célibataires libres & couples curieux. Même vibe, mêmes règles : respect.</p>
              </div>
            </Reveal>
            <Reveal className="spice-card" delay={180}>
              <img src="/photos/p2.jpg" alt="" />
              <div>
                <strong>Discrétion max</strong>
                <p>Tu contrôles ce que tu montres. Album privé. Zéro jugement.</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="pitch" aria-labelledby="pitch-title">
          <div className="page-shell pitch-inner">
            <Reveal delay={40}>
              <p className="eyebrow">Pourquoi PEEMENTE</p>
              <h2 id="pitch-title">
                Pas un site de rencontre classique.
                <span> Un terrain de jeu pour esprits libres.</span>
              </h2>
            </Reveal>

            <div className="pitch-points">
              <Reveal className="pitch-item" delay={80}>
                <span>01</span>
                <h3>Intentions claires</h3>
                <p>
                  Soft, hot, curiosité, couple ouvert… Tu dis ce que tu cherches.
                  Plus de malentendus.
                </p>
              </Reveal>
              <Reveal className="pitch-item" delay={120}>
                <span>02</span>
                <h3>100% Péi</h3>
                <p>
                  Une communauté locale, près de chez toi. Moins de fantômes,
                  plus de vraies connexions à La Réunion.
                </p>
              </Reveal>
              <Reveal className="pitch-item" delay={160}>
                <span>03</span>
                <h3>Ton rythme</h3>
                <p>
                  Stories, likes, messages… Tu avances comme tu veux.
                  Libre, discret, sans pression.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="tease" aria-label="Ambiance">
          <div className="page-shell tease-row">
            <Reveal className="tease-copy" delay={60}>
              <h2>
                Ici, on ne joue pas les saints.
                <span> On assume.</span>
              </h2>
              <p>
                PEEMENTE, c’est le piment réunionnais version rencontres :
                chaud, direct, et un peu dangereux… dans le bon sens.
              </p>
              <ul>
                <li>Profils vérifiés à venir</li>
                <li>Mode discret</li>
                <li>Communauté couples & solos</li>
              </ul>
            </Reveal>
            <Reveal className="tease-photos" delay={120}>
              <img src="/photos/p1.jpg" alt="" className="tease-a" />
              <img src="/photos/moment.jpg" alt="" className="tease-b" />
              <img src="/photos/p2.jpg" alt="" className="tease-c" />
            </Reveal>
          </div>
        </section>

        <section className="waitlist-section" aria-label="Rappel inscription">
          <div className="page-shell waitlist-wrap">
            <Reveal delay={40}>
              <p className="eyebrow">Accès anticipé</p>
              <h2>Pas encore inscrit ?</h2>
              <p className="waitlist-intro">
                Les premiers membres auront l’accès prioritaire au lancement.
              </p>
              <a className="btn-primary" href="#waitlist">
                Remonter au formulaire
                <span aria-hidden="true">↑</span>
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <footer>
        <div className="page-shell footer-inner">
          <div className="footer-brand">
            <img className="footer-logo" src="/logo.png" alt="" width={36} height={36} />
            <p>© {new Date().getFullYear()} PEEMENTE</p>
          </div>
          <p>La Réunion · Bientôt en ligne.</p>
        </div>
      </footer>
    </>
  );
}
