import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/waitlist-security";

export async function GET() {
  return NextResponse.json(
    { challenge: createChallenge() },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
