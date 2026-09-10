"use client";

import { useEffect, useState } from "react";

export default function IntroCurtain() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem("peemente-intro-seen");
    const skip = document.documentElement.classList.contains("intro-skip");

    if (reduced || seen || skip) {
      document.documentElement.classList.remove("intro-pending");
      document.documentElement.classList.add("intro-skip");
      setVisible(false);
      return;
    }

    window.sessionStorage.setItem("peemente-intro-seen", "1");

    const leaveTimer = window.setTimeout(() => setLeaving(true), 1200);
    const hideTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("intro-pending");
      setVisible(false);
    }, 1750);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`intro-curtain ${leaving ? "is-leaving" : ""}`} aria-hidden="true">
      <img className="intro-mark" src="/logo.png" alt="" width={88} height={88} />
      <div className="intro-logo">PEEMENTE</div>
      <div className="intro-line" />
      <small>100% Péi · bientôt</small>
    </div>
  );
}
