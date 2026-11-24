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
          website,
          challenge,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Une erreur est survenue.");
      }

      try {
        localStorage.setItem("peemente-email", email);
      } catch {}

      setModal({
        type: "success",
        title: data?.alreadyRegistered ? "Déjà inscrit" : "C’est noté",
        message: data?.alreadyRegistered
          ? "Cet email est déjà inscrit. On ne t’oublie pas."
          : "Tu seras prévenu·e dès le lancement.",
      });
      form.reset();
    } catch (error) {
      setModal({
        type: "error",
        title: "Échec de l’inscription",
        message: error.message || "Impossible de t’inscrire pour le moment.",
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
              <h2 id="waitlist-modal-title">{modal.title}</h2>
              <p>{modal.message}</p>
              {modal.type === "success" && (
                <div className="modal-cta">
                  <strong>Dis-nous ce que tu veux vraiment, on le crée pour toi.</strong>
                  <span>Facultatif · formulaire rapide · 3 minutes</span>
                  <a className="survey-btn" href="/questionnaire">
                    C&apos;est parti !
                  </a>
                </div>
              )}
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
        <p className="waitlist-intro">
          L’appli ouvre bientôt. Laisse ton e-mail, on te prévient en premier.
          <strong>Un cadeau t’attend à l’ouverture. 🎁</strong>
        </p>
        <label className="sr-only" htmlFor="email">
          Votre adresse email
        </label>

        <div className="form-row">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="Ton e-mail"
            required
            maxLength={254}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Préviens-moi →"}
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
      </form>

      <div className="survey-cta">
        <p>
          <strong>Dis-nous ce que tu veux vraiment, on le crée pour toi.</strong>
          <span>Facultatif · formulaire rapide · 3 minutes</span>
        </p>
        <a className="survey-btn" href="/questionnaire">
          C&apos;est parti !
        </a>
      </div>

      {modalNode}
    </>
  );
}
