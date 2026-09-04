"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [challenge, setChallenge] = useState("");

  async function refreshChallenge() {
    try {
      const response = await fetch("/api/waitlist/challenge", {
        cache: "no-store",
      });
      const data = await response.json();
      if (data?.challenge) setChallenge(data.challenge);
    } catch {
      setChallenge("");
    }
  }

  useEffect(() => {
    setMounted(true);
    refreshChallenge();
  }, []);

  useEffect(() => {
    if (!modal) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event) {
      if (event.key === "Escape") setModal(null);
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [modal]);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email")?.toString().trim();
    const website = formData.get("website")?.toString() || "";

    if (!email) {
      setModal({
        type: "error",
        title: "Email manquant",
        message: "Entrez une adresse email valide.",
      });
      return;
    }

    if (!challenge) {
      setModal({
        type: "error",
        title: "Sécurité",
        message: "Chargement anti-spam en cours. Réessayez dans un instant.",
      });
      refreshChallenge();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "coming-soon-la-reunion",
          website,
          challenge,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Une erreur est survenue.");
      }

      setModal({
        type: "success",
        title: data?.alreadyRegistered ? "Déjà inscrit" : "Inscription réussie",
        message: data?.alreadyRegistered
          ? "Cet email est déjà inscrit. On ne vous oublie pas."
          : "C’est noté. On vous préviendra au lancement.",
      });
      form.reset();
    } catch (error) {
      setModal({
        type: "error",
        title: "Échec de l’inscription",
        message: error.message || "Impossible de vous inscrire pour le moment.",
      });
    } finally {
      setLoading(false);
      refreshChallenge();
    }
  }

  const modalNode =
    modal && mounted
      ? createPortal(
          <div
            className="waitlist-modal-overlay"
            role="presentation"
            onClick={() => setModal(null)}
          >
            <div
              className={`waitlist-modal ${modal.type}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="waitlist-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="waitlist-modal-kicker" aria-hidden="true">
                {modal.type === "success" ? "✓" : "!"}
              </p>
              <h2 id="waitlist-modal-title">{modal.title}</h2>
              <p>{modal.message}</p>
              <button type="button" onClick={() => setModal(null)}>
                Fermer
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <form className="waitlist" onSubmit={handleSubmit} noValidate>
        <div className="waitlist-heading">
          <div>
            <strong>Soyez prévenu au lancement</strong>
            <span>
              Nous vous écrirons dès qu’Allo Doudou sera disponible à La Réunion.
            </span>
          </div>
          <span className="mail-symbol" aria-hidden="true">✦</span>
        </div>

        <label className="sr-only" htmlFor="email">Votre adresse email</label>

        <div className="form-row">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="votre@email.com"
            required
            maxLength={254}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Me prévenir"}
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="hp-field" aria-hidden="true">
          <label htmlFor="website">Votre site web</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="form-meta">
          <p className="form-privacy">Un seul email au lancement. Pas de spam.</p>
        </div>
      </form>

      {modalNode}
    </>
  );
}
