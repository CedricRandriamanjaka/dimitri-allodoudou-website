import crypto from "node:crypto";

function getSecret() {
  return (
    process.env.WAITLIST_CHALLENGE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "peemente-dev-challenge"
  );
}

export function signChallenge(ts, nonce) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`${ts}.${nonce}`)
    .digest("hex");
}

export function createChallenge() {
  const ts = Date.now();
  const nonce = crypto.randomBytes(16).toString("hex");
  return `${ts}.${nonce}.${signChallenge(ts, nonce)}`;
}

export function verifyChallenge(
  challenge,
  { minAgeMs = 1800, maxAgeMs = 30 * 60 * 1000 } = {}
) {
  if (typeof challenge !== "string") {
    return { ok: false, reason: "missing" };
  }

  const parts = challenge.split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "format" };
  }

  const [tsRaw, nonce, sig] = parts;
  const ts = Number(tsRaw);

  if (!Number.isFinite(ts) || !nonce || !sig) {
    return { ok: false, reason: "format" };
  }

  const expected = signChallenge(ts, nonce);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "signature" };
  }

  const age = Date.now() - ts;
  if (age < minAgeMs || age > maxAgeMs) {
    return { ok: false, reason: "age" };
  }

  return { ok: true };
}
