"use client";

import { useEffect, useState } from "react";

export default function IntroCurtain() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem("peemente-intro-seen");
    if (reduced || seen) return;

    setVisible(true);
    window.sessionStorage.setItem("peemente-intro-seen", "1");

    const leaveTimer = window.setTimeout(() => setLeaving(true), 1100);
    const hideTimer = window.setTimeout(() => setVisible(false), 1650);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`intro-curtain ${leaving ? "is-leaving" : ""}`} aria-hidden="true">
      <img className="intro-mark" src="/logo.png" alt="" width={88} height={88} />
      <div className="intro-logo">
        <strong>PEEMENTE</strong>
      </div>
      <div className="intro-line" />
      <small>100% Péi · bientôt</small>
    </div>
  );
}
