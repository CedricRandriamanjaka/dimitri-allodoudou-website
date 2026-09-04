"use client";

import { useEffect, useState } from "react";

export default function IntroCurtain() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem("allo-doudou-intro-seen");
    if (reduced || seen) return;

    setVisible(true);
    window.sessionStorage.setItem("allo-doudou-intro-seen", "1");

    const leaveTimer = window.setTimeout(() => setLeaving(true), 900);
    const hideTimer = window.setTimeout(() => setVisible(false), 1450);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`intro-curtain ${leaving ? "is-leaving" : ""}`} aria-hidden="true">
      <div className="intro-logo">
        <span>Allo</span>
        <strong>Doudou</strong>
      </div>
      <div className="intro-line" />
      <small>La Réunion · bientôt</small>
    </div>
  );
}
