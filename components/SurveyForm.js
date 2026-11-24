"use client";

import { useEffect, useRef, useState } from "react";
import { EMAIL_RE, QUESTIONS, STEPS, TEXT_MAX, fieldError } from "@/lib/survey";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const KEYS = "ABCDEFGHIJK";
const SCREENS = STEPS.flatMap((step, section) =>
  (step.fields.length ? step.fields : ["email"]).map((name) => ({ name, section, title: step.title }))
);
const LAST = SCREENS.length - 1;

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ARROW = "M5 12h14M13 6l6 6-6 6";
const CHECK = "M5 12.5l4.5 4.5L19 7.5";

export default function SurveyForm() {
  const [index, setIndex] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [challenge, setChallenge] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const widgetRef = useRef(null);
  const widgetId = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    try {
      setEmail(localStorage.getItem("peemente-email") || "");
    } catch {}
    fetch("/api/waitlist/challenge", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setChallenge(d?.challenge || ""))
      .catch(() => {});
    return () => clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (index !== LAST || !SITE_KEY) return;
    let alive = true;
    const render = () => {
      if (!alive || !widgetRef.current) return;
      widgetId.current = window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY,
        callback: setToken,
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) render();
    else {
      let script = document.getElementById("cf-turnstile");
      if (!script) {
        script = document.createElement("script");
        script.id = "cf-turnstile";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }
    return () => {
      alive = false;
      if (widgetId.current !== null) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
      setToken("");
    };
  }, [index]);

  // Raccourcis clavier : lettres pour choisir, Entrée pour valider
  useEffect(() => {
    function onKey(event) {
      if (event.metaKey || event.ctrlKey || event.altKey || loading) return;
      if (event.target.closest?.("textarea, input[type=email], input[type=text], button, a")) return;
      if (index === -1) {
        if (event.key === "Enter") go(0);
        return;
      }
      const name = SCREENS[index]?.name;
      const q = QUESTIONS[name];
      if (!q) return;
      if (event.key === "Enter") {
        event.preventDefault();
        next();
        return;
      }
      const i = event.key.length === 1 ? KEYS.indexOf(event.key.toUpperCase()) : -1;
      if (q.options && i >= 0 && i < q.options.length) {
        event.preventDefault();
        choose(name, q.options[i][0]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function go(target) {
    clearTimeout(timer.current);
    setError("");
    setIndex(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() {
    if (index === LAST) return;
    const name = SCREENS[index].name;
    const err = fieldError(name, answers[name]);
    if (err) setError(err);
    else go(index + 1);
  }

  function set(name, value) {
    setAnswers((a) => ({ ...a, [name]: value }));
    setError("");
  }

  function choose(name, value) {
    const q = QUESTIONS[name];
    if (q.type === "single") {
      set(name, value);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => go(index + 1), 380);
      return;
    }
    setError("");
    setAnswers((a) => {
      const current = a[name] || [];
      if (current.includes(value)) return { ...a, [name]: current.filter((v) => v !== value) };
      return !q.max || current.length < q.max ? { ...a, [name]: [...current, value] } : a;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (index !== LAST) return next();
    if (loading) return;

    const mail = email.trim();
    if (mail && !EMAIL_RE.test(mail)) return setError("Adresse e-mail invalide.");
    if (mail && !consent) return setError("Coche la case pour être prévenu·e à l'ouverture.");
    if (SITE_KEY && !token) return setError("Vérification anti-spam en cours, patiente un instant.");

    const website = new FormData(event.currentTarget).get("website") || "";
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, email: mail, consent, challenge, turnstileToken: token, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Une erreur est survenue.");
      if (mail) {
        try {
          localStorage.setItem("peemente-email", mail);
        } catch {}
      }
      go(SCREENS.length);
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
      if (widgetId.current !== null) window.turnstile?.reset(widgetId.current);
      setToken("");
    } finally {
      setLoading(false);
    }
  }

  const progress = index < 0 ? 0 : Math.min(index + 1, SCREENS.length) / SCREENS.length;
  const progressBar = (
    <div className="tf-progress" role="progressbar" aria-label="Progression" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
      <span style={{ width: `${progress * 100}%` }} />
    </div>
  );
  const enterHint = (
    <span className="tf-enter">
      appuie sur <kbd>Entrée ↵</kbd>
    </span>
  );

  if (index === -1) {
    return (
      <section className="tf" aria-labelledby="tf-title">
        {progressBar}
        <div className="tf-screen tf-intro">
          <span className="tf-section">Peemente · 100 % péi</span>
          <h1 id="tf-title">
            Bientôt <span>à La Réunion</span>
          </h1>
          <p className="tf-lead">Dis-nous ce que tu veux vraiment. On le crée pour toi.</p>
          <p className="tf-brand">Peemente, le réseau social libertin 100 % péi.</p>
          <ul className="tf-pills">
            <li>Discret</li>
            <li>Vérifié</li>
            <li>Respectueux</li>
          </ul>
          <div className="tf-actions">
            <button type="button" className="tf-ok is-lg" onClick={() => go(0)}>
              C&apos;est parti ! <Icon d={ARROW} size={18} />
            </button>
            {enterHint}
          </div>
          <p className="tf-meta">
            <Icon d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" size={15} /> Durée estimée : 3 minutes
          </p>
        </div>
      </section>
    );
  }

  if (index === SCREENS.length) {
    return (
      <section className="tf" role="status">
        {progressBar}
        <div className="tf-screen tf-intro">
          <span className="tf-done-icon">
            <Icon d={CHECK} size={38} />
          </span>
          <h1>Merci, c&apos;est noté.</h1>
          <p className="tf-lead">Tes réponses vont vraiment compter. On te prévient dès l&apos;ouverture.</p>
          <a className="tf-ok" href="/">
            Retour à l&apos;accueil
          </a>
        </div>
      </section>
    );
  }

  const { name, section, title } = SCREENS[index];
  const q = QUESTIONS[name];
  const value = answers[name];
  const headId = `tf-q-${name}`;
  const hint =
    name === "email"
      ? "Facultatif. On te prévient à l'ouverture, et ton e-mail nous permet de mettre à jour tes réponses."
      : q.max
        ? `Choisis jusqu'à ${q.max} réponses · ${(value || []).length}/${q.max}`
        : q.hint;

  return (
    <form className="tf" onSubmit={handleSubmit} noValidate>
      {progressBar}
      <div key={index} className="tf-screen">
        <span className="tf-section">
          {String(section + 1).padStart(2, "0")} · {title}
        </span>

        <div className="tf-q-head">
          <span className="tf-num">
            {index + 1} <Icon d={ARROW} size={14} />
          </span>
          <div>
            <h2 id={headId}>{q ? q.label : "Laisse ton e-mail pour être prévenu·e à l'ouverture"}</h2>
            {hint && <p className="tf-hint">{hint}</p>}
          </div>
        </div>

        <div className="tf-body">
          {name === "email" ? (
            <>
              <input
                className="tf-text"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="ton@email.re"
                maxLength={254}
                aria-labelledby={headId}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                autoFocus
              />
              <p className="tf-gift">🎁 Un cadeau t&apos;attend à l&apos;ouverture.</p>
              {email.trim() && (
                <label className="tf-consent">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>J&apos;accepte d&apos;être prévenu·e par e-mail à l&apos;ouverture de Peemente.</span>
                </label>
              )}
              <div ref={widgetRef} />
              <div className="hp-field" aria-hidden="true">
                <label htmlFor="tf-website">Votre site web</label>
                <input id="tf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
            </>
          ) : q.type === "text" ? (
            <>
              <textarea
                className="tf-text"
                rows={1}
                maxLength={TEXT_MAX}
                placeholder="Écris ta réponse ici…"
                aria-labelledby={headId}
                value={value || ""}
                onChange={(e) => set(name, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    next();
                  }
                }}
                autoFocus
              />
              <p className="tf-count">
                Maj + Entrée pour un saut de ligne · {(value || "").length}/{TEXT_MAX}
              </p>
            </>
          ) : (
            <div
              className={`tf-choices${q.options.length > 7 ? " is-wide" : ""}`}
              role={q.type === "single" ? "radiogroup" : "group"}
              aria-labelledby={headId}
            >
              {q.options.map(([v, label], i) => {
                const multi = q.type === "multi";
                const checked = multi ? (value || []).includes(v) : value === v;
                const disabled = Boolean(multi && !checked && q.max && (value || []).length >= q.max);
                return (
                  <label key={v} className={`tf-choice${checked ? " is-checked" : ""}${disabled ? " is-disabled" : ""}`}>
                    <input
                      type={multi ? "checkbox" : "radio"}
                      name={name}
                      value={v}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => choose(name, v)}
                    />
                    <span className="tf-key" aria-hidden="true">
                      {KEYS[i]}
                    </span>
                    <span>{label}</span>
                    <span className="tf-check">
                      <Icon d={CHECK} size={18} />
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {error && (
            <p className="tf-error" role="alert">
              {error}
            </p>
          )}

          <div className="tf-actions">
            {index === LAST ? (
              <button type="submit" className="tf-ok" disabled={loading}>
                {loading ? "Envoi…" : "J'envoie mes réponses"} <Icon d={ARROW} size={18} />
              </button>
            ) : (
              <button type="button" className="tf-ok" onClick={next}>
                OK <Icon d={CHECK} size={18} />
              </button>
            )}
            {enterHint}
          </div>
        </div>
      </div>

      <div className="tf-nav">
        <button type="button" aria-label="Question précédente" onClick={() => go(index - 1)} disabled={loading}>
          <Icon d="M6 15l6-6 6 6" size={18} />
        </button>
        <button type="button" aria-label="Question suivante" onClick={next} disabled={loading || index === LAST}>
          <Icon d="M6 9l6 6 6-6" size={18} />
        </button>
      </div>
    </form>
  );
}
