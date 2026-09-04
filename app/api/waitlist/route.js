import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_INTERVAL_MS = 60_000;
const MAX_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

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
    const waitSec = Math.ceil((MIN_INTERVAL_MS - (now - times[times.length - 1])) / 1000);
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

async function checkDbRateLimit(supabase, ipHash) {
  if (ipHash === "unknown") return { ok: true };

  const since = new Date(Date.now() - HOUR_MS).toISOString();
  const { data, error } = await supabase
    .from("waitlist")
    .select("created_at")
    .eq("ip_hash", ipHash)
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase rate-limit lookup error:", error);
    return { ok: true };
  }

  if ((data?.length || 0) >= MAX_PER_HOUR) {
    return {
      ok: false,
      error: "Limite atteinte : 5 envois par heure. Réessayez plus tard.",
    };
  }

  if (data?.[0]) {
    const elapsed = Date.now() - new Date(data[0].created_at).getTime();
    if (elapsed < MIN_INTERVAL_MS) {
      const waitSec = Math.ceil((MIN_INTERVAL_MS - elapsed) / 1000);
      return {
        ok: false,
        error: `Attendez ${waitSec} s avant un nouvel essai.`,
      };
    }
  }

  return { ok: true };
}

export async function POST(request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 20_000) {
      return NextResponse.json({ error: "Requête invalide." }, { status: 413 });
    }

    const body = await request.json();
    const {
      email,
      source = "coming-soon-la-reunion",
      website = "",
    } = body || {};

    if (website) {
      return NextResponse.json({ ok: true });
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

    const clientIp = getClientIp(request);
    const ipHash = hashIp(clientIp);

    const memoryLimit = checkMemoryRateLimit(ipHash);
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

    const dbLimit = await checkDbRateLimit(supabase, ipHash);
    if (!dbLimit.ok) {
      return NextResponse.json({ error: dbLimit.error }, { status: 429 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const safeSource = String(source).slice(0, 80);

    const { data: existing, error: existingError } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingError) {
      console.error("Supabase waitlist lookup error:", existingError);
      return NextResponse.json(
        { error: "Impossible d’enregistrer votre email pour le moment." },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({ ok: true, alreadyRegistered: true });
    }

    const { error } = await supabase.from("waitlist").insert({
      email: normalizedEmail,
      source: safeSource,
      ip_hash: ipHash === "unknown" ? null : ipHash,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, alreadyRegistered: true });
      }

      console.error("Supabase waitlist insert error:", error);
      return NextResponse.json(
        { error: "Impossible d’enregistrer votre email pour le moment." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, alreadyRegistered: false });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
