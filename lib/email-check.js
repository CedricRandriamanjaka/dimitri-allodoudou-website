import { resolve4, resolveMx } from "node:dns/promises";

// shortcut: liste courte à la main, passer au paquet « disposable-email-domains » si des jetables passent
const DISPOSABLE = new Set([
  "mailinator.com", "yopmail.com", "yopmail.fr", "guerrillamail.com", "sharklasers.com",
  "10minutemail.com", "tempmail.com", "temp-mail.org", "trashmail.com", "throwawaymail.com",
  "getnada.com", "dispostable.com", "maildrop.cc", "fakeinbox.com", "mailnesia.com", "mintemail.com",
]);

const TYPOS = {
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gmail.co": "gmail.com",
  "gmail.fr": "gmail.com", "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com", "outlok.com": "outlook.com", "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com", "orage.fr": "orange.fr", "wanadoo.com": "wanadoo.fr",
};

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEOUT" })), ms));

/** Renvoie un message d'erreur si l'e-mail est manifestement faux, sinon null. */
export async function checkEmail(email) {
  const domain = String(email).split("@")[1]?.toLowerCase();
  if (!domain) return "Adresse e-mail invalide.";
  if (DISPOSABLE.has(domain)) return "Les adresses e-mail temporaires ne sont pas acceptées.";
  if (TYPOS[domain]) return `Adresse e-mail invalide : tu voulais dire @${TYPOS[domain]} ?`;

  try {
    const mx = await Promise.race([resolveMx(domain), timeout(3000)]);
    // MX nul (RFC 7505) : le domaine déclare ne jamais recevoir de mail
    if (mx.some((m) => m.exchange)) return null;
  } catch (e) {
    // erreur réseau ou timeout : on laisse passer plutôt que bloquer un vrai visiteur
    if (e.code !== "ENODATA" && e.code !== "ENOTFOUND") return null;
    // pas de MX : repli RFC sur un enregistrement A
    try {
      await Promise.race([resolve4(domain), timeout(3000)]);
      return null;
    } catch (e2) {
      if (e2.code !== "ENODATA" && e2.code !== "ENOTFOUND") return null;
    }
  }
  return "Cette adresse e-mail semble inexistante. Vérifie-la.";
}
