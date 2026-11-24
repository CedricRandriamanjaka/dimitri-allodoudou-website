import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { EMAIL_RE } from "@/lib/survey";
import { isAllowedOrigin, verifyChallenge } from "@/lib/waitlist-security";

const MIN_INTERVAL_MS = 60_000;
const MAX_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

// shortcut: limite en mémoire par instance serverless (IP hachée jamais stockée), passer à Upstash/Redis si spam réel
/** @type {Map<string, number[]>} */
const attemptBuckets = new Map();

function getClientIp(request) {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    ""
  );
}

function hashIp(ip) {
  return ip
    ? crypto.createHash("sha256").update(ip).digest("hex").slice(0, 24)
    : "unknown";
}

function checkMemoryRateLimit(key) {
  const now = Date.now();
  const times = (attemptBuckets.get(key) || []).filter((t) => now - t < HOUR_MS);

  if (times.length > 0 && now - times[times.length - 1] < MIN_INTERVAL_MS) {
    const waitSec = Math.ceil(
      (MIN_INTERVAL_MS - (now - times[times.length - 1])) / 1000
    );
    return {
      ok: false,
      error: `Attendez ${waitSec} s avant un nouvel essai.`,
    };
  }

  if (times.length >= MAX_PER_HOUR) {
    return {
      ok: false,
      error: "Limite atteinte : 5 envois par heure. Réessayez plus tard.",
    };
  }

  times.push(now);
  attemptBuckets.set(key, times);
  return { ok: true };
}

export async function POST(request) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 20_000) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 413 });
    }

    const body = await request.json();
    const { email, website = "", challenge = "" } = body || {};

    // Honeypot : bots qui remplissent les champs cachés
    if (website) {
      return NextResponse.json({ ok: true });
    }

    const challengeCheck = verifyChallenge(challenge);
    if (!challengeCheck.ok) {
      return NextResponse.json(
        { error: "Vérification anti-spam échouée. Rechargez la page et réessayez." },
        { status: 403 }
      );
    }

    if (
      typeof email !== "string" ||
      email.length > 254 ||
      !EMAIL_RE.test(email)
    ) {
      return NextResponse.json(
        { error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    const memoryLimit = checkMemoryRateLimit(hashIp(getClientIp(request)));
    if (!memoryLimit.ok) {
      return NextResponse.json({ error: memoryLimit.error }, { status: 429 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Configuration serveur incomplète." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // « Préviens-moi » vaut consentement explicite : même table que le questionnaire
    const { error } = await supabase.from("launch_contacts").insert({
      email: email.trim().toLowerCase(),
      notification_consent: true,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, alreadyRegistered: true });
      }

      console.error("launch_contacts insert error:", error.code);
      return NextResponse.json(
        { error: "Impossible d’enregistrer votre email pour le moment." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, alreadyRegistered: false });
  } catch (error) {
    console.error("Waitlist API error:", error?.name);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
