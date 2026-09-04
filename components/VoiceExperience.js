"use client";

import { useEffect, useRef, useState } from "react";

const moods = {
  parler: {
    label: "Parler",
    title: "Quelqu’un qui écoute.",
    text: "Un moment pour déposer ce que vous avez en tête.",
    bars: [26,44,68,40,86,58,94,48,72,34,80,60,90,46,66,30,54,76],
  },
  rire: {
    label: "Rire",
    title: "Une parenthèse plus légère.",
    text: "Une voix, un sourire, et quelques minutes hors du bruit.",
    bars: [44,72,38,88,62,95,48,76,58,90,36,84,52,70,96,42,68,54],
  },
  souffler: {
    label: "Souffler",
    title: "Juste ralentir un peu.",
    text: "Pas besoin d’en faire trop. Quelques minutes peuvent suffire.",
    bars: [24,36,48,62,78,54,42,68,82,58,46,72,64,50,38,56,70,44],
  },
};

export default function VoiceExperience() {
  const wrapRef = useRef(null);
  const [mood, setMood] = useState("parler");
  const current = moods[mood];

  useEffect(() => {
    const stored = window.localStorage.getItem("allo-doudou-mood");
    if (stored && moods[stored]) setMood(stored);
  }, []);

  function chooseMood(next) {
    setMood(next);
    window.localStorage.setItem("allo-doudou-mood", next);
  }

  function handlePointerMove(event) {
    const node = wrapRef.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--mx", `${x * 16}px`);
    node.style.setProperty("--my", `${y * 16}px`);
  }

  function resetPointer() {
    const node = wrapRef.current;
    if (!node) return;
    node.style.setProperty("--mx", "0px");
    node.style.setProperty("--my", "0px");
  }

  return (
    <div
      ref={wrapRef}
      className="hero-visual interactive-visual"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="soft-glow" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />

      <div className="voice-card interactive-card">
        <div className="voice-card-top">
          <div>
            <span className="mini-kicker">Ce soir, j’ai envie de…</span>
            <strong>{current.title}</strong>
          </div>

          <span className="audio-icon" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
        </div>

        <div className="waveform mood-waveform" aria-hidden="true">
          {current.bars.map((h, i) => (
            <i key={`${mood}-${i}`} style={{ "--h": `${h}%`, "--i": i }} />
          ))}
        </div>

        <p className="mood-copy">{current.text}</p>

        <div className="mood-picker" role="group" aria-label="Choisir une envie">
          {Object.entries(moods).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={mood === key ? "active" : ""}
              onClick={() => chooseMood(key)}
              aria-pressed={mood === key}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="voice-footer">
          <span className="play-circle" aria-hidden="true">♥</span>
          <div>
            <small>Votre humeur, votre moment.</small>
            <span>Allo Doudou s’adapte à ce que vous cherchez.</span>
          </div>
        </div>
      </div>

      <div className="privacy-card interactive-privacy">
        <span className="privacy-icon">◌</span>
        <div>
          <strong>Simplement discret.</strong>
          <small>Pas de caméra. Pas de numéro partagé.</small>
        </div>
      </div>
    </div>
  );
}
