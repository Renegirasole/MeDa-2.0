import type { Facts } from "./facts";

export type ExplainResponse = { ok: true; text: string } | { ok: false; reason: "unavailable" | "unverified" | "error" };

export async function requestExplanation(facts: Facts, signal?: AbortSignal): Promise<ExplainResponse> {
  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facts }),
      signal,
    });
    if (res.status === 501) return { ok: false, reason: "unavailable" };
    if (res.status === 422) return { ok: false, reason: "unverified" };
    if (!res.ok) return { ok: false, reason: "error" };
    const data: unknown = await res.json();
    if (typeof data === "object" && data !== null && "text" in data && typeof data.text === "string") {
      return { ok: true, text: data.text };
    }
    return { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
