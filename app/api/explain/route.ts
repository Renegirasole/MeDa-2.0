import { NextResponse } from "next/server";
import { isFacts } from "@/lib/ai/facts";
import { SYSTEM_PROMPT, userPrompt } from "@/lib/ai/prompt";
import { sanitizeAiText, verifyNumbers } from "@/lib/ai/guard";

export const runtime = "nodejs";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;

// Límite básico por IP. En producción con varias instancias, moverlo a Upstash/Redis.
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ai_unavailable" }, { status: 501 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const facts = typeof body === "object" && body !== null && "facts" in body ? body.facts : null;
  if (!isFacts(facts)) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt(facts) }],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return NextResponse.json({ error: "upstream" }, { status: 502 });

    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = sanitizeAiText(
      (data.content ?? [])
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text)
        .join("\n"),
    );
    if (!text) return NextResponse.json({ error: "empty" }, { status: 502 });

    // La IA no puede inventar cifras: si aparece una sola nueva, se descarta.
    const check = verifyNumbers(text, facts);
    if (!check.ok) return NextResponse.json({ error: "unverified" }, { status: 422 });

    return NextResponse.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
