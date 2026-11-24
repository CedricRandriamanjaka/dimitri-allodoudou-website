import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { verifyChallenge } from "@/lib/waitlist-security";
import { EMAIL_RE, validateSurvey } from "@/lib/survey";

const HOUR_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 3;
// shortcut: limite en mémoire par instance serverless (IP hachée jamais stockée), Turnstile reste la vraie barrière ; passer à Upstash/Redis si spam réel
const buckets = new Map();

function fail(error, status) {
  return NextResponse.json({ error }, { status });
}

function isRateLimited(request) {
  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  if (!ip) return false;
  const key = crypto.createHash("sha256").update(ip).digest("hex");
  const now = Date.now();
  const times = (buckets.get(key) || []).filter((t) => now - t < HOUR_MS);
  if (times.length >= MAX_PER_HOUR) return true;
  buckets.set(key, [...times, now]);
  return false;
}

async function verifyTurnstile(token, secret) {
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json().catch(() => ({}));
  return data.success === true;
}

export async function POST(request) {
  try {
    if (Number(request.headers.get("content-length") || 0) > 20_000) {
      return fail("Requête invalide.", 413);
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TURNSTILE_SECRET_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TURNSTILE_SECRET_KEY) {
      return fail("Configuration serveur incomplète.", 500);
    }

    const body = await request.json().catch(() => null);
    if (!body) return fail("Requête invalide.", 400);
    if (body.website) return NextResponse.json({ ok: true });

    // Un humain ne remplit pas 11 questions en moins de 20 s
    if (!verifyChallenge(body.challenge, { minAgeMs: 20_000, maxAgeMs: 2 * HOUR_MS }).ok) {
      return fail("Vérification anti-spam échouée. Recharge la page et réessaie.", 403);
    }

    const answers = validateSurvey(body.answers);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!answers || (email && (email.length > 254 || !EMAIL_RE.test(email) || body.consent !== true))) {
      return fail("Réponses incomplètes ou invalides.", 400);
    }

    if (!(await verifyTurnstile(body.turnstileToken, TURNSTILE_SECRET_KEY))) {
      return fail("Vérification anti-spam échouée. Réessaie.", 403);
    }
    if (isRateLimited(request)) return fail("Trop d'envois. Réessaie plus tard.", 429);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Contact d'abord : en cas d'échec, un nouvel essai ne crée pas de réponse en double
    if (email) {
      const { error } = await supabase
        .from("launch_contacts")
        .insert({ email, notification_consent: true });
      if (error && error.code !== "23505") {
        console.error("launch_contacts insert error:", error.code);
        return fail("Impossible d'enregistrer tes réponses pour le moment.", 500);
      }
    }

    const { error } = await supabase.from("survey_responses").insert(answers);
    if (error) {
      // Seul le code est loggé : error.details peut contenir la ligne refusée
      console.error("survey_responses insert error:", error.code);
      return fail("Impossible d'enregistrer tes réponses pour le moment.", 500);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Survey API error:", error?.name);
    return fail("Erreur serveur.", 500);
  }
}
